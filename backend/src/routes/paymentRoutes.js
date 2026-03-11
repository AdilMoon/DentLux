const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

// Создать платеж
router.post('/:appointmentId', paymentController.create);

// Получить мои платежи
router.get('/my', paymentController.getMy);

// Получить все платежи (только для админа)
router.get('/', roleMiddleware('ADMIN'), paymentController.getAll);

// Получить платежи, ожидающие подтверждения (только для админа)
router.get('/pending', roleMiddleware('ADMIN'), paymentController.getPendingPayments);

// Подтвердить платеж (только для админа)
router.patch('/:id/confirm', roleMiddleware('ADMIN'), paymentController.confirmPayment);

// Скачать чек
router.get('/:id/receipt', paymentController.downloadReceipt);

module.exports = router;

