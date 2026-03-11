const jwt = require('jsonwebtoken');
const AppError = require('../utils/errors');

// JWT токенді тексеру
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Токен табылмады', 401);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Жарамсыз токен', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Токен мерзімі өткен', 401));
    }
    next(error);
  }
};

// Опциональная проверка авторизации (не требует токен, но устанавливает req.user если токен есть)
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (error) {
        // Токен невалидный или истек, но это не ошибка для опционального middleware
        req.user = null;
      }
    }
    next();
  } catch (error) {
    // В случае любой ошибки просто продолжаем без req.user
    req.user = null;
    next();
  }
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuthMiddleware;
