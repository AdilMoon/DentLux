const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

// Создать возврат
router.post('/:paymentId', refundController.create);

// Получить мои возвраты
router.get('/my', refundController.getMy);

// Получить все возвраты (только админ)
router.get('/', roleMiddleware('ADMIN'), refundController.getAll);

// Обновить возврат (только админ)
router.patch('/:id', roleMiddleware('ADMIN'), refundController.update);

module.exports = router;



