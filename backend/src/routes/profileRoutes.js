const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');
const upload = require('../utils/upload');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Валидация для обновления профиля
const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Аты-жөні 2-255 символ арасында болуы керек')
    .escape(),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email дұрыс емес'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+7\d{10}$/)
    .withMessage('Номер должен начинаться с +7 и содержать 10 цифр (например: +77001234567)'),
  body('password')
    .optional()
    .custom((value) => {
      if (!value || value.length === 0) return true;
      if (value.length < 9) return false;
      const letters = (value.match(/[a-zA-Zа-яА-ЯёЁәӘіІңҢғҒүҮұҰқҚөӨһҺ]/g) || []).length;
      const digits = (value.match(/\d/g) || []).length;
      const special = (value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
      return letters >= 6 && digits >= 2 && special >= 1;
    })
    .withMessage('Пароль кемінде 9 символ, 6 әріп, 2 сан және 1 арнайы символ болуы керек'),
  handleValidationErrors,
];

// Получить текущий профиль
router.get('/', profileController.getProfile.bind(profileController));

// Обновить профиль
router.patch('/', updateProfileValidation, profileController.updateProfile.bind(profileController));
router.put('/', updateProfileValidation, profileController.updateProfile.bind(profileController));

// Загрузить фото профиля
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar.bind(profileController));

module.exports = router;
