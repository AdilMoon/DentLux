const contactService = require('../services/contactService');
const AppError = require('../utils/errors');

class ContactController {
  // Отправить сообщение из контактной формы
  async submitMessage(req, res, next) {
    try {
      const { name, email, phone, message } = req.body;
      
      const result = await contactService.submitContactMessage({
        name,
        email,
        phone,
        message,
      });

      res.status(201).json({
        success: true,
        message: 'Хабарлама сәтті жіберілді',
        data: result,
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Получить все сообщения (для админа)
  async getAllMessages(req, res, next) {
    try {
      const messages = await contactService.getAllMessages();
      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  // Отметить сообщение как прочитанное
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      await contactService.markAsRead(id);
      res.json({
        success: true,
        message: 'Хабарлама оқылған деп белгіленді',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContactController();
