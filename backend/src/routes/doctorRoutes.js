const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/authMiddleware').optionalAuth;
const roleMiddleware = require('../middlewares/roleMiddleware');
const upload = require('../utils/upload');

// Получить всех врачей (публичный endpoint, но проверяем авторизацию если токен есть)
// Для админов показываются все докторы (включая заблокированных)
// Для остальных - только незаблокированные
router.get('/', optionalAuthMiddleware, doctorController.getAll.bind(doctorController));

// Админские endpoints требуют аутентификации и роли ADMIN
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Создать доктора
router.post('/', doctorController.create.bind(doctorController));

// Обновить доктора
router.put('/:id', doctorController.update.bind(doctorController));
router.patch('/:id', doctorController.update.bind(doctorController));

// Загрузить фото доктора
router.post('/:id/avatar', upload.single('avatar'), doctorController.uploadAvatar.bind(doctorController));

// Заблокировать доктора
router.post('/:id/block', doctorController.blockDoctor.bind(doctorController));

// Разблокировать доктора
router.post('/:id/unblock', doctorController.unblockDoctor.bind(doctorController));

// Удалить доктора
router.delete('/:id', doctorController.delete.bind(doctorController));

module.exports = router;
