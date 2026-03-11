const rateLimit = require('express-rate-limit');

// Отключить rate limiting, если установлена переменная окружения
const DISABLE_RATE_LIMIT = process.env.DISABLE_RATE_LIMIT === 'true';

// Rate limiter для аутентификации (более строгий)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: process.env.NODE_ENV === 'production' ? 20 : 100, // в production: 20 запросов, в development: 100
  message: 'Слишком много попыток входа. Попробуйте через 15 минут.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // не считать успешные запросы
  skip: (req) => {
    // Отключаем rate limit, если установлена переменная DISABLE_RATE_LIMIT=true
    if (DISABLE_RATE_LIMIT) return true;
    // Пропускаем rate limit для health checks
    return req.path === '/health' || req.path === '/';
  },
});

// Общий rate limiter для API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // в production: 100, в development: 1000
  message: 'Слишком много запросов. Попробуйте позже.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Отключаем rate limit, если установлена переменная DISABLE_RATE_LIMIT=true
    if (DISABLE_RATE_LIMIT) return true;
    // Пропускаем rate limit для /api/auth, так как там есть свой authLimiter
    return req.path.startsWith('/api/auth');
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
