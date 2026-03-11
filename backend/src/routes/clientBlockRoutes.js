const express = require('express');
const router = express.Router();
const clientBlockController = require('../controllers/clientBlockController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Админские endpoints
router.post('/:clientId/block', roleMiddleware('ADMIN'), clientBlockController.blockClient.bind(clientBlockController));
router.patch('/:id/unblock', roleMiddleware('ADMIN'), clientBlockController.unblockClient.bind(clientBlockController));
router.get('/active', roleMiddleware('ADMIN'), clientBlockController.getActiveBlocks.bind(clientBlockController));
router.get('/client/:clientId', clientBlockController.getClientBlocks.bind(clientBlockController));

// Проверить статус блокировки (доступно всем авторизованным)
router.get('/check/:clientId?', clientBlockController.checkBlockStatus.bind(clientBlockController));

module.exports = router;
