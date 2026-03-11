const authService = require('../services/authService');
const AppError = require('../utils/errors');

class AuthController {
  // Регистрация
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      // Если это AppError, передаем статус код
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Вход
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email и пароль обязательны',
        });
      }
      
      const result = await authService.login(email, password);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      // Если это AppError, передаем статус код
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

}

module.exports = new AuthController();
