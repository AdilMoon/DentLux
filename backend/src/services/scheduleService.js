const appointmentRepository = require('../repositories/appointmentRepository');
const doctorRepository = require('../repositories/doctorRepository');
const AppError = require('../utils/errors');

class ScheduleService {
  /**
   * Получить доступные слоты времени для доктора на указанную дату
   */
  async getAvailableTimeSlots(doctorId, date) {
    // Получаем информацию о докторе
    const doctor = await doctorRepository.findByUserId(doctorId);
    if (!doctor) {
      throw new AppError('Дәрігер табылмады', 404);
    }

    // Парсим расписание доктора
    let workSchedule = {};
    if (doctor.workSchedule) {
      try {
        workSchedule = typeof doctor.workSchedule === 'string' 
          ? JSON.parse(doctor.workSchedule) 
          : doctor.workSchedule;
      } catch (error) {
        console.error('Ошибка парсинга расписания доктора:', error);
        workSchedule = {};
      }
    }

    // Если расписание не настроено, используем дефолтное
    if (!workSchedule || Object.keys(workSchedule).length === 0) {
      workSchedule = this.getDefaultSchedule();
    }

    // Получаем день недели (0 = воскресенье, 1 = понедельник, ...)
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    // Получаем рабочие часы на этот день
    const daySchedule = workSchedule[dayName];
    if (!daySchedule || !daySchedule.available || !daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
      return []; // Доктор не работает в этот день
    }

    // Получаем все записи доктора на эту дату (doctorId здесь это userId доктора)
    const existingAppointments = await appointmentRepository.findByDoctorIdAndDate(doctorId, date);

    // Создаем Set занятых времен
    // Исключаем только отмененные и пропущенные записи - все остальные блокируют слот
    const bookedTimes = new Set(
      existingAppointments
        .filter(apt => apt.status !== 'CANCELLED' && apt.status !== 'MISSED')
        .map(apt => {
          let timeStr = '';
          if (!apt.appointmentTime) {
            return '';
          }
          
          // Обработка разных форматов времени
          if (typeof apt.appointmentTime === 'string') {
            // Если это строка формата HH:mm или HH:mm:ss
            timeStr = apt.appointmentTime.slice(0, 5);
          } else if (apt.appointmentTime instanceof Date) {
            // Если это объект Date
            timeStr = apt.appointmentTime.toTimeString().slice(0, 5);
          } else {
            // Если это объект Time из Prisma (обычно имеет метод toTimeString или свойство)
            try {
              timeStr = new Date(`1970-01-01T${apt.appointmentTime}`).toTimeString().slice(0, 5);
            } catch (e) {
              console.error('Ошибка форматирования времени:', apt.appointmentTime, e);
              return '';
            }
          }
          return timeStr;
        })
        .filter(time => time.length > 0) // Убираем пустые значения
    );

    // Возвращаем все слоты с информацией о доступности
    const allSlots = daySchedule.timeSlots.map(slot => ({
      time: slot,
      available: !bookedTimes.has(slot),
    }));

    return allSlots;
  }

  /**
   * Получить дефолтное расписание (если не настроено)
   */
  getDefaultSchedule() {
    // Дефолтное расписание: пн-пт 9:00-18:00 с интервалом 1 час
    const defaultTimeSlots = [
      '09:00', '10:00', '11:00', '12:00', 
      '14:00', '15:00', '16:00', '17:00'
    ];

    return {
      monday: { available: true, timeSlots: defaultTimeSlots },
      tuesday: { available: true, timeSlots: defaultTimeSlots },
      wednesday: { available: true, timeSlots: defaultTimeSlots },
      thursday: { available: true, timeSlots: defaultTimeSlots },
      friday: { available: true, timeSlots: defaultTimeSlots },
      saturday: { available: true, timeSlots: defaultTimeSlots },
      sunday: { available: false, timeSlots: [] },
    };
  }

  /**
   * Обновить расписание доктора (принимает userId)
   */
  async updateDoctorSchedule(userId, schedule) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) {
      throw new AppError('Дәрігер табылмады', 404);
    }

    // Валидация расписания
    const validSchedule = this.validateSchedule(schedule);

    // Обновляем расписание (используем doctor.id - это id записи Doctor)
    await doctorRepository.updateSchedule(doctor.id, validSchedule);

    return validSchedule;
  }

  /**
   * Валидация расписания
   */
  validateSchedule(schedule) {
    const validSchedule = {};
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    dayNames.forEach(day => {
      if (schedule[day] && schedule[day].available) {
        // Валидация временных слотов
        if (Array.isArray(schedule[day].timeSlots)) {
          const validTimeSlots = schedule[day].timeSlots.filter(slot => {
            // Проверяем формат HH:mm
            return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(slot);
          });
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
