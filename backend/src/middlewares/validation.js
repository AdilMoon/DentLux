const { validationResult, body, param, query } = require('express-validator');
const { ValidationError } = require('../utils/errors');

// Middleware для обработки результатов валидации
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return next(new ValidationError(errorMessages));
  }
  next();
};

// UUID валидация
const uuidValidation = (field = 'id') => {
  return param(field)
    .isUUID()
    .withMessage(`Некорректный формат ${field}`);
};

// Email валидация
const emailValidation = (field = 'email') => {
  return body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage('Некорректный email адрес');
};

// Пароль валидация (минимум 9 символов, 6 букв, 2 цифры, 1 специальный символ)
const passwordValidation = (field = 'password') => {
  return body(field)
    .isLength({ min: 9 })
    .withMessage('Пароль должен содержать минимум 9 символов')
    .custom((value) => {
      const letters = (value.match(/[a-zA-Zа-яА-ЯёЁәӘіІңҢғҒүҮұҰқҚөӨһҺ]/g) || []).length;
      const digits = (value.match(/\d/g) || []).length;
      const special = (value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
      
      if (letters < 6) {
        throw new Error('Пароль должен содержать минимум 6 букв');
      }
      if (digits < 2) {
        throw new Error('Пароль должен содержать минимум 2 цифры');
      }
      if (special < 1) {
        throw new Error('Пароль должен содержать минимум 1 специальный символ');
      }
      return true;
    })
    .trim()
    .escape(); // Санитизация для защиты от XSS
};

// Валидация для регистрации
const registerValidation = [
  emailValidation('email'),
  passwordValidation('password'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Имя должно содержать от 2 до 255 символов')
    .escape(), // Санитизация для защиты от XSS
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+7\d{10}$/)
    .withMessage('Номер должен начинаться с +7 и содержать 10 цифр (например: +77001234567)'),
  body('role')
    .optional()
    .isIn(['CLIENT', 'DOCTOR', 'ADMIN'])
    .withMessage('Некорректная роль'),
  handleValidationErrors,
];

// Валидация для входа
const loginValidation = [
  emailValidation('email'),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен'),
  handleValidationErrors,
];

// Валидация для создания записи
const createAppointmentValidation = [
  body('doctorId')
    .isUUID()
    .withMessage('Некорректный ID врача'),
  body('serviceId')
    .isUUID()
    .withMessage('Некорректный ID услуги'),
  body('appointmentDate')
    .isISO8601()
    .toDate()
    .withMessage('Некорректная дата (формат: YYYY-MM-DD)')
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (value < today) {
        throw new Error('Дата записи не может быть в прошлом');
      }
      return true;
    }),
  body('appointmentTime')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Некорректное время (формат: HH:MM)'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Примечания не должны превышать 1000 символов'),
  handleValidationErrors,
];

// Валидация для обновления статуса записи
const updateAppointmentStatusValidation = [
  uuidValidation('id'),
  body('status')
    .isIn(['BOOKED', 'VISITED', 'NOT_VISITED', 'DONE', 'PENDING', 'ARRIVED', 'MISSED', 'COMPLETED', 'CANCELLED'])
    .withMessage('Некорректный статус'),
  handleValidationErrors,
];

// Валидация для создания возврата
const createRefundValidation = [
  param('paymentId')
    .isUUID()
    .withMessage('Некорректный ID платежа'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Причина возврата должна содержать от 10 до 500 символов'),
  handleValidationErrors,
];

// Валидация для обработки возврата
const processRefundValidation = [
  uuidValidation('id'),
  body('status')
    .isIn(['APPROVED', 'REJECTED'])
    .withMessage('Некорректный статус'),
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Примечания не должны превышать 500 символов'),
  handleValidationErrors,
];

// Валидация для создания расхода
const createExpenseValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Сумма должна быть положительным числом'),
  body('category')
    .isIn(['SALARY', 'EQUIPMENT', 'RENT', 'UTILITIES', 'SUPPLIES', 'OTHER'])
    .withMessage('Некорректная категория расхода'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Описание должно содержать от 5 до 500 символов'),
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Некорректная дата (формат: YYYY-MM-DD)'),
  handleValidationErrors,
];

// Валидация для аналитики
const analyticsValidation = [
  query('startDate')
    .isISO8601()
    .withMessage('Некорректная начальная дата (формат: YYYY-MM-DD)'),
  query('endDate')
    .isISO8601()
    .withMessage('Некорректная конечная дата (формат: YYYY-MM-DD)')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.query.startDate)) {
        throw new Error('Конечная дата не может быть раньше начальной');
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  uuidValidation,
  emailValidation,
  passwordValidation,
  registerValidation,
  loginValidation,
  createAppointmentValidation,
  updateAppointmentStatusValidation,
  createRefundValidation,
  processRefundValidation,
  createExpenseValidation,
  analyticsValidation,
};
