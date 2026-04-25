const appointmentRepository = require('../repositories/appointmentRepository');
const doctorRepository = require('../repositories/doctorRepository');
const AppError = require('../utils/errors');

const FULL_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Короткие ключи из seed (mon, tue, …) → полные имена дней */
const SHORT_DAY_TO_FULL = {
  sun: 'sunday',
  sunday: 'sunday',
  mon: 'monday',
  monday: 'monday',
  tue: 'tuesday',
  tues: 'tuesday',
  tuesday: 'tuesday',
  wed: 'wednesday',
  wednesday: 'wednesday',
  thu: 'thursday',
  thur: 'thursday',
  thursday: 'thursday',
  fri: 'friday',
  friday: 'friday',
  sat: 'saturday',
  saturday: 'saturday',
};

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** YYYY-MM-DD + смещение дней (UTC) */
function addDaysYmd(ymd, deltaDays) {
  const d = new Date(`${ymd}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function appointmentDateToYmd(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function timeToHHmm(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    return value.slice(0, 5);
  }
  if (value instanceof Date) {
    return value.toISOString().slice(11, 16);
  }
  try {
    return new Date(`1970-01-01T${value}`).toISOString().slice(11, 16);
  } catch {
    return '';
  }
}

function parseHHmm(s) {
  const m = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.exec((s || '').trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function minutesToHHmm(total) {
  const h = Math.floor(total / 60);
  const mm = total % 60;
  return `${pad2(h)}:${pad2(mm)}`;
}

/** Слоты каждые stepMinutes между start и end (конец не включён как начало слота) */
function generateSlotsFromRange(startStr, endStr, stepMinutes = 30) {
  const startM = parseHHmm(startStr);
  const endM = parseHHmm(endStr);
  if (startM === null || endM === null || endM <= startM) return [];
  const slots = [];
  for (let t = startM; t + stepMinutes <= endM; t += stepMinutes) {
    slots.push(minutesToHHmm(t));
  }
  return slots;
}

class ScheduleService {
  getDefaultSchedule() {
    const defaultTimeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    return {
      monday: { available: true, timeSlots: defaultTimeSlots },
      tuesday: { available: true, timeSlots: defaultTimeSlots },
      wednesday: { available: true, timeSlots: defaultTimeSlots },
      thursday: { available: true, timeSlots: defaultTimeSlots },
      friday: { available: true, timeSlots: defaultTimeSlots },
      saturday: { available: true, timeSlots: ['10:00', '11:00', '12:00', '14:00'] },
      sunday: { available: false, timeSlots: [] },
    };
  }

  /**
   * Приводит work_schedule из БД к формату { monday: { available, timeSlots }, ... }
   * Поддержка: полный JSON из кабинета врача; seed с mon/tue и строкой "09:00-18:00".
   */
  normalizeWorkSchedule(raw) {
    if (!raw) {
      return this.getDefaultSchedule();
    }

    let parsed = raw;
    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw);
      } catch {
        return this.getDefaultSchedule();
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return this.getDefaultSchedule();
    }

    const keys = Object.keys(parsed);
    const looksLikeFullWeek = FULL_DAYS.some((d) => Object.prototype.hasOwnProperty.call(parsed, d));

    if (looksLikeFullWeek) {
      const out = {};
      FULL_DAYS.forEach((day) => {
        const v = parsed[day];
        if (v && v.available && Array.isArray(v.timeSlots) && v.timeSlots.length) {
          const valid = v.timeSlots.filter((slot) => /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(slot));
          out[day] = { available: true, timeSlots: [...new Set(valid)].sort() };
        } else {
          out[day] = { available: false, timeSlots: [] };
        }
      });
      const any = FULL_DAYS.some((d) => out[d].available && out[d].timeSlots.length);
      return any ? out : this.getDefaultSchedule();
    }

    // Короткие ключи + строка диапазона "09:00-18:00"
    const out = {};
    FULL_DAYS.forEach((d) => {
      out[d] = { available: false, timeSlots: [] };
    });

    keys.forEach((k) => {
      const full = SHORT_DAY_TO_FULL[k.toLowerCase()];
      if (!full) return;
      const val = parsed[k];
      if (typeof val === 'string' && val.includes('-')) {
        const [a, b] = val.split('-').map((s) => s.trim());
        const slots = generateSlotsFromRange(a, b, 30);
        if (slots.length) {
          out[full] = { available: true, timeSlots: slots };
        }
      } else if (val && typeof val === 'object' && val.available && Array.isArray(val.timeSlots)) {
        const valid = val.timeSlots.filter((slot) => /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(slot));
        if (valid.length) {
          out[full] = { available: true, timeSlots: [...new Set(valid)].sort() };
        }
      }
    });

    const any = FULL_DAYS.some((d) => out[d].available && out[d].timeSlots.length);
    return any ? out : this.getDefaultSchedule();
  }

  dayNameFromYmd(ymd) {
    const d = new Date(`${ymd}T12:00:00.000Z`);
    return FULL_DAYS[d.getUTCDay()];
  }

  buildBookedSet(appointments) {
    return new Set(
      appointments
        .filter((apt) => apt.status !== 'CANCELLED' && apt.status !== 'MISSED')
        .map((apt) => timeToHHmm(apt.appointmentTime))
        .filter(Boolean),
    );
  }

  /**
   * Слоты на один день (массив { time, available })
   */
  computeSlotsForDay(normalizedSchedule, ymd, bookedTimes) {
    const dayName = this.dayNameFromYmd(ymd);
    const daySchedule = normalizedSchedule[dayName];
    if (!daySchedule || !daySchedule.available || !daySchedule.timeSlots || !daySchedule.timeSlots.length) {
      return [];
    }
    return daySchedule.timeSlots.map((slot) => ({
      time: slot,
      available: !bookedTimes.has(slot),
    }));
  }

  async getAvailableTimeSlots(doctorId, date) {
    const doctor = await doctorRepository.findByUserId(doctorId);
    if (!doctor) {
      throw new AppError('Дәрігер табылмады', 404);
    }

    const workSchedule = this.normalizeWorkSchedule(doctor.workSchedule);
    const existingAppointments = await appointmentRepository.findByDoctorIdAndDate(doctorId, date);
    const bookedTimes = this.buildBookedSet(existingAppointments);

    return this.computeSlotsForDay(workSchedule, date, bookedTimes);
  }

  /**
   * Обзор свободных дней на диапазон (для календаря записи).
   * @param {string} doctorId — userId врача
   * @param {string} startYmd — YYYY-MM-DD
   * @param {number} days — количество дней от start
   */
  async getAvailabilityCalendar(doctorId, startYmd, days = 35) {
    const doctor = await doctorRepository.findByUserId(doctorId);
    if (!doctor) {
      throw new AppError('Дәрігер табылмады', 404);
    }

    const n = Math.min(Math.max(parseInt(String(days), 10) || 35, 1), 90);
    const endYmd = addDaysYmd(startYmd, n - 1);

    const workSchedule = this.normalizeWorkSchedule(doctor.workSchedule);
    const allAppointments = await appointmentRepository.findByDoctorIdAndDateRange(
      doctorId,
      startYmd,
      endYmd,
    );

    const byDate = new Map();
    allAppointments.forEach((apt) => {
      const ymd = appointmentDateToYmd(apt.appointmentDate);
      if (!byDate.has(ymd)) byDate.set(ymd, []);
      byDate.get(ymd).push(apt);
    });

    const calendar = [];
    for (let i = 0; i < n; i += 1) {
      const ymd = addDaysYmd(startYmd, i);
      const dayApts = byDate.get(ymd) || [];
      const booked = this.buildBookedSet(dayApts);
      const slots = this.computeSlotsForDay(workSchedule, ymd, booked);
      const freeSlotCount = slots.filter((s) => s.available).length;
      const working = slots.length > 0;
      calendar.push({
        date: ymd,
        working,
        freeSlotCount,
        hasAvailability: working && freeSlotCount > 0,
      });
    }

    return {
      doctorId,
      startDate: startYmd,
      days: n,
      calendar,
    };
  }

  async updateDoctorSchedule(userId, schedule) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) {
      throw new AppError('Дәрігер табылмады', 404);
    }

    const validSchedule = this.validateSchedule(schedule);
    await doctorRepository.updateSchedule(doctor.id, validSchedule);

    return validSchedule;
  }

  validateSchedule(schedule) {
    const validSchedule = {};
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    dayNames.forEach((day) => {
      if (schedule[day] && schedule[day].available) {
        if (Array.isArray(schedule[day].timeSlots)) {
          const validTimeSlots = schedule[day].timeSlots.filter((slot) =>
            /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(slot),
          );
          validSchedule[day] = {
            available: true,
            timeSlots: validTimeSlots.sort(),
          };
        } else {
          validSchedule[day] = { available: false, timeSlots: [] };
        }
      } else {
        validSchedule[day] = { available: false, timeSlots: [] };
      }
    });

    return validSchedule;
  }
}

module.exports = new ScheduleService();
