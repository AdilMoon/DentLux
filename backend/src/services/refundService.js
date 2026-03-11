const refundRepository = require('../repositories/refundRepository');
const paymentRepository = require('../repositories/paymentRepository');
const AppError = require('../utils/errors');

class RefundService {
  // Создать возврат
  async createRefund(paymentId, reason, clientId) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      throw new AppError('Платеж не найден', 404);
    }

    // Проверяем, что платеж принадлежит клиенту
    if (payment.appointment.clientId !== clientId) {
      throw new AppError('Нет доступа', 403);
    }

    const refund = await refundRepository.create({
      paymentId,
      clientId,
      amount: payment.amount,
      reason,
      status: 'PENDING',
    });

    return this.formatRefund(refund);
  }

  // Получить мои возвраты
  async getMyRefunds(clientId) {
    const refunds = await refundRepository.findByClientId(clientId);
    return refunds.map(r => this.formatRefund(r));
  }

  // Получить все возвраты (для админа)
  async getAllRefunds() {
    const refunds = await refundRepository.findAll();
    return refunds.map(r => this.formatRefund(r));
  }

  // Обновить возврат
  async updateRefund(id, status, adminNotes, processedBy) {
    const refund = await refundRepository.findById(id);
    if (!refund) {
      throw new AppError('Возврат не найден', 404);
    }

    const updateData = {
      status,
      adminNotes,
      processedBy,
      processedAt: status !== 'PENDING' ? new Date() : null,
    };

    const updated = await refundRepository.update(id, updateData);
    return this.formatRefund(updated);
  }

  // Форматировать возврат
  formatRefund(refund) {
    return {
      id: refund.id,
      paymentId: refund.paymentId,
      amount: Number(refund.amount),
      reason: refund.reason,
      status: refund.status,
      createdAt: refund.createdAt.toISOString(),
      serviceName: refund.payment?.appointment?.service?.name,
      clientName: refund.client?.fullName,
    };
  }
}

module.exports = new RefundService();
