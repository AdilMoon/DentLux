const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Все маршруты требуют аутентификации и роли ADMIN
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Получить всех клиентов
router.get('/', clientController.getAll.bind(clientController));

// Создать клиента
router.post('/', clientController.create.bind(clientController));

// Обновить клиента
router.put('/:id', clientController.update.bind(clientController));
router.patch('/:id', clientController.update.bind(clientController));

// Удалить клиента
router.delete('/:id', clientController.delete.bind(clientController));

module.exports = router;



