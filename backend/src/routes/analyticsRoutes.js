const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Все маршруты аналитики требуют аутентификации и роли ADMIN
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Получить финансовую аналитику
router.get('/finance', analyticsController.getFinance);

// Получить дневную статистику
router.get('/daily', analyticsController.getDaily);

// Экспорт аналитики в Excel
router.get('/export/excel', analyticsController.exportExcel);

module.exports = router;

