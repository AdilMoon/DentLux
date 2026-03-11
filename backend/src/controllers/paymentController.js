const paymentService = require('../services/paymentService');
const { generateReceiptPDF } = require('../utils/pdfGenerator');
const AppError = require('../utils/errors');
const roleMiddleware = require('../middlewares/roleMiddleware');

class PaymentController {
  // Создать платеж
  async create(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const { paymentMethod = 'CASH' } = req.body; // CASH или CARD
      
      if (!['CASH', 'CARD'].includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          error: 'Некорректный метод оплаты. Используйте CASH или CARD',
        });
      }

      const payment = await paymentService.createPayment(appointmentId, req.user.id, paymentMethod);
      res.status(201).json({
        success: true,
        data: payment,
        message: payment.status === 'PENDING' 
          ? 'Платеж создан и ожидает подтверждения администратора' 
          : 'Платеж успешно создан',
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить мои платежи
  async getMy(req, res, next) {
    try {
      const payments = await paymentService.getMyPayments(req.user.id);
      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить все платежи (для админа)
  async getAll(req, res, next) {
    try {
      const payments = await paymentService.getAllPayments();
      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Подтвердить платеж (только для админа)
  async confirmPayment(req, res, next) {
    try {
      const { id } = req.params;
      const payment = await paymentService.confirmPayment(id, req.user.id);
      res.json({
        success: true,
        data: payment,
        message: 'Платеж подтвержден',
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить платежи, ожидающие подтверждения (только для админа)
  async getPendingPayments(req, res, next) {
    try {
      const payments = await paymentService.getPendingPayments();
      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Скачать чек
  async downloadReceipt(req, res, next) {
    try {
      const { id } = req.params;
      const isAdmin = req.user.role === 'ADMIN';
      const payment = await paymentService.getPaymentById(id, req.user.id, isAdmin);

      // Чек можно скачать только для подтвержденных платежей
      if (payment.status !== 'PAID') {
        return res.status(400).json({
          success: false,
          error: 'Чек доступен только для подтвержденных платежей',
        });
      }

      // Генерируем PDF
      const doc = generateReceiptPDF(
        payment,
        payment.appointment,
        payment.appointment.service,
        payment.appointment.client
      );

      // Устанавливаем заголовки для скачивания
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receipt-${payment.id}.pdf`);

      // Отправляем PDF
      doc.pipe(res);
      doc.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();



