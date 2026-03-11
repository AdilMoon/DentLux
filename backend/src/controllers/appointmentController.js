const appointmentService = require('../services/appointmentService');
const AppError = require('../utils/errors');

class AppointmentController {
  // Создать запись
  async create(req, res, next) {
    try {
      const appointment = await appointmentService.createAppointment(
        req.body,
        req.user.id
      );
      res.status(201).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить мои записи (клиент)
  async getMy(req, res, next) {
    try {
      const appointments = await appointmentService.getMyAppointments(req.user.id);
      res.json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить записи доктора
  async getDoctorAppointments(req, res, next) {
    try {
      const appointments = await appointmentService.getDoctorAppointments(req.user.id);
      res.json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить все записи (для админа)
  async getAll(req, res, next) {
    try {
      const appointments = await appointmentService.getAllAppointments();
      res.json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновить статус
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const appointment = await appointmentService.updateStatus(
        id,
        status,
        req.user.id,
        req.user.role
      );
      res.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Отменить запись
  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      await appointmentService.cancelAppointment(id, req.user.id);
      res.json({
        success: true,
        message: 'Запись отменена',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentController();



