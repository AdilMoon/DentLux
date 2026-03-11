const paymentGatewayService = require('../services/paymentGatewayService');
const paymentService = require('../services/paymentService');
const paymentRepository = require('../repositories/paymentRepository');
const AppError = require('../utils/errors');

class PaymentGatewayController {
  /**
   * Создать платеж через платежный шлюз
   */
  async createGatewayPayment(req, res, next) {
    try {
      const { appointmentId } = req.body;
      const userId = req.user.id;

      // Создаем платеж в нашей системе
      const payment = await paymentService.createPayment(appointmentId, userId);

      // Создаем платеж в платежном шлюзе
      const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/${payment.id}/success`;
      const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/${payment.id}/cancel`;

      const gatewayResult = await paymentGatewayService.createPayment({
        orderId: payment.id,
        amount: Number(payment.amount),
        currency: 'KZT',
        returnUrl,
        cancelUrl,
        description: `Оплата записи #${appointmentId}`,
      });

      // Обновляем платеж с данными от шлюза
      await paymentRepository.updateGatewayInfo(payment.id, {
        gatewayTransactionId: gatewayResult.transactionId,
        gatewayType: process.env.PAYMENT_GATEWAY || 'KASPI',
        paymentUrl: gatewayResult.paymentUrl,
        status: 'PENDING', // Ожидание оплаты
      });

      res.json({
        success: true,
        data: {
          paymentId: payment.id,
          paymentUrl: gatewayResult.paymentUrl,
          transactionId: gatewayResult.transactionId,
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
   * Проверить статус платежа
   */
  async checkPaymentStatus(req, res, next) {
    try {
      const { paymentId } = req.params;

      const payment = await paymentRepository.findById(paymentId);
      if (!payment) {
        throw new AppError('Платеж не найден', 404);
      }

      if (!payment.gatewayTransactionId) {
        return res.json({
          success: true,
          data: {
            status: payment.status,
            paymentId: payment.id,
          },
        });
      }

      // Проверяем статус в платежном шлюзе
      const gatewayStatus = await paymentGatewayService.checkPaymentStatus(
        payment.gatewayTransactionId
      );

      // Обновляем статус в нашей системе, если изменился
      if (gatewayStatus.status === 'PAID' && payment.status !== 'PAID') {
        await paymentRepository.updateStatus(payment.id, 'PAID');
      }

      res.json({
        success: true,
        data: {
          status: gatewayStatus.status || payment.status,
          paymentId: payment.id,
          transactionId: payment.gatewayTransactionId,
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
   * Webhook от платежного шлюза
   */
  async handleWebhook(req, res, next) {
    try {
      const webhookData = req.body;

      const result = await paymentGatewayService.handleWebhook(webhookData);

      // Обновляем статус платежа в базе данных
      if (result.transactionId) {
        const payment = await paymentRepository.findByGatewayTransactionId(result.transactionId);
        if (payment && result.status === 'PAID') {
          await paymentRepository.updateStatus(payment.id, 'PAID');
        }
      }

      res.json({
        success: true,
        message: 'Webhook обработан',
      });
    } catch (error) {
      console.error('Webhook error:', error);
      // Webhook должен возвращать 200 даже при ошибке, чтобы шлюз не повторял запрос
      res.status(200).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new PaymentGatewayController();
