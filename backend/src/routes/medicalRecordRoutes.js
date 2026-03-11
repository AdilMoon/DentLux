const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { param, body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Валидация для создания/обновления медицинской записи
const createMedicalRecordValidation = [
  param('appointmentId').isUUID().withMessage('Некорректный ID записи'),
  body('diagnosis').optional().isLength({ max: 5000 }).withMessage('Диагноз тым ұзын'),
  body('treatment').optional().isLength({ max: 5000 }).withMessage('Емдеу тым ұзын'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('Ескертпелер тым ұзын'),
  body('prescriptions').optional().isLength({ max: 2000 }).withMessage('Дәрі-дәрмектер тым ұзын'),
  handleValidationErrors,
];

// Создать или обновить медицинскую запись (доступно доктору и админу)
router.put(
  '/appointments/:appointmentId',
  roleMiddleware('DOCTOR', 'ADMIN'),
  createMedicalRecordValidation,
  medicalRecordController.createOrUpdate.bind(medicalRecordController)
);

router.patch(
  '/appointments/:appointmentId',
  roleMiddleware('DOCTOR', 'ADMIN'),
  createMedicalRecordValidation,
  medicalRecordController.createOrUpdate.bind(medicalRecordController)
);

// Получить медицинскую запись по appointmentId
router.get(
  '/appointments/:appointmentId',
  [
    param('appointmentId').isUUID().withMessage('Некорректный ID записи'),
    handleValidationErrors,
  ],
  medicalRecordController.getByAppointmentId.bind(medicalRecordController)
);

// Скачать PDF медицинской записи
router.get(
  '/appointments/:appointmentId/download',
  [
    param('appointmentId').isUUID().withMessage('Некорректный ID записи'),
    handleValidationErrors,
  ],
  medicalRecordController.downloadPDF.bind(medicalRecordController)
);

// Получить историю пациента (для доктора)
router.get(
  '/patients/:clientId/history',
  roleMiddleware('DOCTOR', 'ADMIN'),
  [
    param('clientId').isUUID().withMessage('Некорректный ID клиента'),
    handleValidationErrors,
  ],
  medicalRecordController.getPatientHistory.bind(medicalRecordController)
);

// Получить все записи клиента (для клиента и админа)
router.get(
  '/my-records',
  roleMiddleware('CLIENT', 'ADMIN'),
  medicalRecordController.getClientRecords.bind(medicalRecordController)
);

module.exports = router;
