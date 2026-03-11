const paymentRepository = require('../repositories/paymentRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const AppError = require('../utils/errors');

class PaymentService {
  // Создать платеж
  async createPayment(appointmentId, userId, paymentMethod = 'CASH') {
    // Проверяем, что запись существует и принадлежит пользователю
    const appointment = await appointmentRepository.findByIdWithService(appointmentId);
    if (!appointment) {
      throw new AppError('Запись не найдена', 404);
    }

    if (appointment.clientId !== userId) {
      throw new AppError('Нет доступа', 403);
    }

    // Проверяем, нет ли уже платежа для этой записи
    const existingPayment = await paymentRepository.findByAppointmentId(appointmentId);
    if (existingPayment) {
      throw new AppError('Платеж уже существует', 400);
    }

    // Получаем цену из связанного сервиса
    const amount = Number(appointment.service.price);

    const payment = await paymentRepository.create(appointmentId, amount, paymentMethod);
    return this.formatPayment(payment);
  }

  // Подтвердить платеж (для админа)
  async confirmPayment(paymentId, adminId) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      throw new AppError('Платеж не найден', 404);
    }

    if (payment.status === 'PAID') {
      throw new AppError('Платеж уже подтвержден', 400);
    }

    if (payment.status === 'REFUNDED') {
      throw new AppError('Нельзя подтвердить возвращенный платеж', 400);
    }

    const updatedPayment = await paymentRepository.updateStatus(paymentId, 'PAID');
    return this.formatPayment(updatedPayment);
  }

  // Получить мои платежи
  async getMyPayments(userId) {
    const payments = await paymentRepository.findByClientId(userId);
    return payments.map(p => this.formatPayment(p));
  }

  // Получить все платежи (для админа)
  async getAllPayments() {
    const payments = await paymentRepository.findAll();
    return payments.map(p => this.formatPayment(p));
  }

  // Получить платеж по ID для чека
  async getPaymentById(id, userId, isAdmin = false) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new AppError('Платеж не найден', 404);
    }

    // Проверяем доступ - только владелец платежа или админ может получить платеж
    if (!isAdmin && payment.appointment.clientId !== userId) {
      throw new AppError('Нет доступа', 403);
    }

    return payment;
  }

  // Получить платежи, ожидающие подтверждения (для админа)
  async getPendingPayments() {
    const payments = await paymentRepository.findByStatus('PENDING');
    return payments.map(p => this.formatPayment(p));
  }

  // Форматировать платеж
  formatPayment(payment) {
    return {
      id: payment.id,
      appointmentId: payment.appointmentId,
      serviceName: payment.appointment?.service?.name || '',
      amount: Number(payment.amount),
      date: payment.paymentDate.toISOString().split('T')[0],
      paymentDate: payment.paymentDate.toISOString(),
      status: payment.status,
      paymentMethod: payment.paymentMethod || 'CASH',
      clientName: payment.appointment?.client?.fullName,
      clientEmail: payment.appointment?.client?.email,
    };
  }
}

module.exports = new PaymentService();
