const express = require('express');
const router = express.Router();
const paymentGatewayController = require('../controllers/paymentGatewayController');
const authMiddleware = require('../middlewares/authMiddleware');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

// Создать платеж через шлюз (требует авторизации)
router.post(
  '/create',
  authMiddleware,
  [
    body('appointmentId').isUUID().withMessage('Некорректный ID записи'),
    handleValidationErrors,
  ],
  paymentGatewayController.createGatewayPayment.bind(paymentGatewayController)
);

// Проверить статус платежа
router.get(
  '/status/:paymentId',
  authMiddleware,
  [
    param('paymentId').isUUID().withMessage('Некорректный ID платежа'),
    handleValidationErrors,
  ],
  paymentGatewayController.checkPaymentStatus.bind(paymentGatewayController)
);

// Webhook от платежного шлюза (публичный, без авторизации)
router.post(
  '/webhook',
  paymentGatewayController.handleWebhook.bind(paymentGatewayController)
);

module.exports = router;
