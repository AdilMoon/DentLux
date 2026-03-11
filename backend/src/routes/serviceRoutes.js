const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Получить все услуги (публичный endpoint)
router.get('/', serviceController.getAll);

// Админские endpoints требуют аутентификации и роли ADMIN
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Получить все услуги для админа
router.get('/admin', serviceController.getAllForAdmin);

// Создать услугу
router.post('/', serviceController.create);

// Обновить услугу
router.put('/:id', serviceController.update);
router.patch('/:id', serviceController.update);

// Удалить услугу
router.delete('/:id', serviceController.delete);

module.exports = router;



