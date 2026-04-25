const scheduleService = require('../services/scheduleService');
const AppError = require('../utils/errors');

class ScheduleController {
  /**
   * Получить доступные слоты времени для доктора
   */
  async getAvailableSlots(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'Дата обязательна (формат: YYYY-MM-DD)',
        });
      }

      const slots = await scheduleService.getAvailableTimeSlots(doctorId, date);

      res.json({
        success: true,
        data: {
          doctorId,
          date,
          slots: slots, // Массив объектов { time: string, available: boolean }
          availableSlots: slots.filter(s => s.available).map(s => s.time), // Для обратной совместимости
        },
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  /**
   * Календарь доступности: по каждому дню — есть ли приём и сколько свободных слотов
   */
  async getAvailabilityCalendar(req, res, next) {
    try {
      const { doctorId } = req.params;
      let { start, days } = req.query;

      if (!start) {
        const t = new Date();
        start = `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
      }

      const daysNum = days !== undefined ? parseInt(String(days), 10) : 35;
      const data = await scheduleService.getAvailabilityCalendar(doctorId, start, daysNum);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  /**
   * Обновить расписание доктора (только для админа)
   */
  async updateSchedule(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { schedule } = req.body;

      if (!schedule) {
        return res.status(400).json({
          success: false,
          error: 'Расписание обязательно',
        });
      }

      const updatedSchedule = await scheduleService.updateDoctorSchedule(doctorId, schedule);

      res.json({
        success: true,
        data: updatedSchedule,
        message: 'Расписание обновлено',
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }
}

module.exports = new ScheduleController();
