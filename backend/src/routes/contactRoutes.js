const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

// Валидация для отправки сообщения из контактной формы
const submitMessageValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Аты-жөні 2-255 символ арасында болуы керек')
    .escape(),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email дұрыс емес'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Телефон нөмірі дұрыс емес'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Хабарлама 10-2000 символ арасында болуы керек')
    .escape(),
  handleValidationErrors,
];

// Публичный endpoint для отправки сообщения (без аутентификации)
router.post('/', submitMessageValidation, contactController.submitMessage.bind(contactController));

// Защищенные маршруты (только для админа)
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Получить все сообщения
router.get('/', contactController.getAllMessages.bind(contactController));

// Отметить сообщение как прочитанное
router.patch('/:id/read', contactController.markAsRead.bind(contactController));

module.exports = router;
