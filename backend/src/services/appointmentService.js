const appointmentRepository = require('../repositories/appointmentRepository');
const emailService = require('../utils/emailService');
const clientBlockService = require('./clientBlockService');
const doctorService = require('./doctorService');
const AppError = require('../utils/errors');

class AppointmentService {
  // Получить записи клиента
  async getMyAppointments(clientId) {
    const appointments = await appointmentRepository.findByClientId(clientId);
    return this.formatAppointments(appointments);
  }

  // Получить записи доктора
  async getDoctorAppointments(doctorId) {
    const appointments = await appointmentRepository.findByDoctorId(doctorId);
    return this.formatAppointments(appointments);
  }

  // Получить все записи (для админа)
  async getAllAppointments() {
    const appointments = await appointmentRepository.findAll();
    return this.formatAppointments(appointments);
  }

  // Создать запись
  async createAppointment(data, clientId) {
    // Проверяем, не заблокирован ли клиент
    const isBlocked = await clientBlockService.isClientBlocked(clientId);
    if (isBlocked) {
      throw new AppError('Сіз блокталғансыз. Жазылу үшін әкімшімен хабарласыңыз.', 403);
    }

    // Проверяем, не заблокирован ли доктор
    const isDoctorBlocked = await doctorService.isDoctorBlocked(data.doctorId);
    if (isDoctorBlocked) {
      throw new AppError('Бұл дәрігер блокталған. Жазылуға болмайды.', 403);
    }

    // Валидация обязательных полей
    if (!data.doctorId || !data.serviceId || !data.appointmentDate || !data.appointmentTime) {
      throw new AppError('Барлық өрістер міндетті', 400);
    }

    try {
      const appointment = await appointmentRepository.create({
        ...data,
        clientId,
      });
      
      // Отправляем email уведомление клиенту о создании записи
      try {
        const formatted = this.formatAppointment(appointment);
        if (appointment.client.email) {
          await emailService.sendAppointmentConfirmation(appointment.client.email, {
            clientName: formatted.clientName,
            doctorName: formatted.doctorName,
            serviceName: formatted.serviceName,
            date: formatted.appointmentDate,
            time: formatted.appointmentTime,
            notes: formatted.notes,
          });
        }
      } catch (emailError) {
        // Не прерываем создание записи, если email не отправился
        console.error('Ошибка отправки email уведомления:', emailError);
      }
      
      return this.formatAppointment(appointment);
    } catch (error) {
      // Преобразуем ошибки репозитория в AppError
      if (error.name === 'NotFoundError' || error.name === 'ValidationError' || error.name === 'ForeignKeyError') {
        throw new AppError(error.message, 400);
      }
      if (error.name === 'ConflictError') {
        throw new AppError(error.message, 409);
      }
      throw error;
    }
  }

  // Обновить статус
  async updateStatus(id, status, userId, userRole) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw new AppError('Запись не найдена', 404);
    }

    // Проверка прав: доктор может обновлять только свои записи, клиент - только свои, админ - любые
    if (userRole === 'DOCTOR' && appointment.doctorId !== userId) {
      throw new AppError('Нет доступа', 403);
    }
    if (userRole === 'CLIENT' && appointment.clientId !== userId) {
      throw new AppError('Нет доступа', 403);
    }
    // ADMIN может обновлять любые записи

    const updated = await appointmentRepository.updateStatus(id, status);
    const formatted = this.formatAppointment(updated);
    
    // Отправляем email уведомление об изменении статуса
    try {
      const statusLabels = {
        PENDING: 'Күтілуде',
        ARRIVED: 'Келді',
        VISITED: 'Келді',
        MISSED: 'Келмеді',
        COMPLETED: 'Ем жасалды',
        DONE: 'Аяқталды',
        CANCELLED: 'Күшін жойылды',
      };
      const statusLabel = statusLabels[status] || status;
      
      if (updated.client.email) {
        await emailService.sendAppointmentStatusUpdate(updated.client.email, formatted, statusLabel);
      }
    } catch (emailError) {
      console.error('Ошибка отправки email уведомления:', emailError);
    }
    
    return formatted;
  }

  // Отменить запись
  async cancelAppointment(id, userId) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw new AppError('Запись не найдена', 404);
    }

    if (appointment.clientId !== userId) {
      throw new AppError('Нет доступа', 403);
    }

    const formatted = this.formatAppointment(appointment);
    
    await appointmentRepository.delete(id);
    
    // Отправляем email уведомление об отмене
    try {
      if (appointment.client.email) {
        await emailService.sendAppointmentCancellation(appointment.client.email, formatted);
      }
    } catch (emailError) {
      console.error('Ошибка отправки email уведомления:', emailError);
    }
  }

  // Форматировать одну запись
  formatAppointment(appointment) {
    // Обработка времени - может быть Date объектом или строкой
    let timeStr = '';
    if (appointment.appointmentTime) {
      if (typeof appointment.appointmentTime === 'string') {
        timeStr = appointment.appointmentTime.slice(0, 5); // HH:mm
      } else {
        timeStr = appointment.appointmentTime.toTimeString().slice(0, 5); // HH:mm
      }
    }
    
    return {
      id: appointment.id,
      clientId: appointment.clientId,
      clientName: appointment.client.fullName,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctor.fullName,
      serviceId: appointment.serviceId,
      serviceName: appointment.service.name,
      appointmentDate: appointment.appointmentDate.toISOString().split('T')[0],
      appointmentTime: timeStr,
      date: appointment.appointmentDate.toISOString().split('T')[0], // для обратной совместимости
      time: timeStr, // для обратной совместимости
      status: appointment.status,
      notes: appointment.notes,
    };
  }

  // Форматировать массив записей
  formatAppointments(appointments) {
    return appointments.map(apt => this.formatAppointment(apt));
  }
}

module.exports = new AppointmentService();
