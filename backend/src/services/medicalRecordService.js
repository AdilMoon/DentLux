const medicalRecordRepository = require('../repositories/medicalRecordRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const AppError = require('../utils/errors');

class MedicalRecordService {
  // Создать или обновить медицинскую запись
  async createOrUpdate(appointmentId, data, userId, userRole) {
    // Проверяем права доступа
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new AppError('Жазылу табылмады', 404);
    }

    // Доктор может редактировать только свои записи, админ - любые
    if (userRole === 'DOCTOR' && appointment.doctorId !== userId) {
      throw new AppError('Рұқсат жоқ', 403);
    }

    // Валидация данных
    if (data.diagnosis && data.diagnosis.length > 5000) {
      throw new AppError('Диагноз тым ұзын (макс 5000 символ)', 400);
    }
    if (data.treatment && data.treatment.length > 5000) {
      throw new AppError('Емдеу тым ұзын (макс 5000 символ)', 400);
    }
    if (data.notes && data.notes.length > 2000) {
      throw new AppError('Ескертпелер тым ұзын (макс 2000 символ)', 400);
    }
    if (data.prescriptions && data.prescriptions.length > 2000) {
      throw new AppError('Дәрі-дәрмектер тым ұзын (макс 2000 символ)', 400);
    }

    return await medicalRecordRepository.createOrUpdate(appointmentId, data);
  }

  // Получить историю пациента (для доктора)
  async getPatientHistory(doctorId, clientId, userId, userRole) {
    // Доктор может видеть только свою историю с пациентом
    if (userRole === 'DOCTOR' && doctorId !== userId) {
      throw new AppError('Рұқсат жоқ', 403);
    }

    return await medicalRecordRepository.getPatientHistory(doctorId, clientId);
  }

  // Получить медицинскую запись по appointmentId
  async getByAppointmentId(appointmentId, userId, userRole) {
    const record = await medicalRecordRepository.findByAppointmentId(appointmentId);
    
    if (!record) {
      return null; // Запись еще не создана
    }

    // Проверка прав доступа
    if (userRole === 'DOCTOR' && record.doctorId !== userId) {
      throw new AppError('Рұқсат жоқ', 403);
    }
    if (userRole === 'CLIENT' && record.clientId !== userId) {
      throw new AppError('Рұқсат жоқ', 403);
    }

    return record;
  }

  // Получить все записи доктора
  async getDoctorRecords(doctorId, userId, userRole) {
    if (userRole === 'DOCTOR' && doctorId !== userId) {
      throw new AppError('Рұқсат жоқ', 403);
    }

    return await medicalRecordRepository.findByDoctorId(doctorId);
  }

  // Получить все записи клиента
  async getClientRecords(clientId, userId, userRole) {
    if (userRole === 'CLIENT' && clientId !== userId) {
      throw new AppError('Рұқсат жоқ', 403);
    }

    return await medicalRecordRepository.findByClientId(clientId);
  }
}

module.exports = new MedicalRecordService();
