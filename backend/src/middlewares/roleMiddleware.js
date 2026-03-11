const AppError = require('../utils/errors');

// Рөлді тексеру
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Аутентификация қажет', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Бұл операцияға қол жеткізу жоқ', 403));
    }

    next();
  };
};

module.exports = roleMiddleware;
