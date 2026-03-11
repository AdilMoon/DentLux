const medicalRecordService = require('../services/medicalRecordService');
const { generateTreatmentPDF } = require('../utils/treatmentPdfGenerator');
const AppError = require('../utils/errors');

class MedicalRecordController {
  // Скачать PDF плана лечения
  async downloadPDF(req, res, next) {
    try {
      const { appointmentId } = req.params;

      const record = await medicalRecordService.getByAppointmentId(
        appointmentId,
        req.user.id,
        req.user.role
      );

      if (!record) {
        throw new AppError('Медициналық жазба табылмады', 404);
      }

      // Генерируем PDF
      const doc = generateTreatmentPDF(
        record,
        record.appointment,
        record.appointment.service,
        record.doctor,
        record.client
      );

      // Устанавливаем заголовки
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=treatment-plan-${appointmentId}.pdf`);

      // Отправляем PDF
      doc.pipe(res);
      doc.end();
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Создать или обновить медицинскую запись
  async createOrUpdate(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const { diagnosis, treatment, notes, prescriptions } = req.body;

      const record = await medicalRecordService.createOrUpdate(
        appointmentId,
        { diagnosis, treatment, notes, prescriptions },
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: record,
        message: 'Медициналық жазба сақталды',
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Получить медицинскую запись по appointmentId
  async getByAppointmentId(req, res, next) {
    try {
      const { appointmentId } = req.params;

      const record = await medicalRecordService.getByAppointmentId(
        appointmentId,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: record,
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Получить историю пациента (для доктора)
  async getPatientHistory(req, res, next) {
    try {
      const { clientId } = req.params;

      const history = await medicalRecordService.getPatientHistory(
        req.user.id,
        clientId,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Получить все записи клиента
  async getClientRecords(req, res, next) {
    try {
      const records = await medicalRecordService.getClientRecords(
        req.user.id,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: records,
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }
}

module.exports = new MedicalRecordController();
