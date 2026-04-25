const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { query, param, body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

// Публичный endpoint для получения доступных слотов (для клиентов)
router.get(
  '/doctors/:doctorId/available-slots',
  [
    param('doctorId').isUUID().withMessage('Некорректный ID доктора'),
    query('date').isISO8601().withMessage('Некорректная дата (формат: YYYY-MM-DD)'),
    handleValidationErrors,
  ],
  scheduleController.getAvailableSlots.bind(scheduleController)
);

router.get(
  '/doctors/:doctorId/availability-calendar',
  [
    param('doctorId').isUUID().withMessage('Некорректный ID доктора'),
    query('start')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Некорректная дата start (формат: YYYY-MM-DD)'),
    query('days')
      .optional()
      .isInt({ min: 1, max: 90 })
      .withMessage('days: целое число 1–90'),
    handleValidationErrors,
  ],
  scheduleController.getAvailabilityCalendar.bind(scheduleController)
);

// Защищенный endpoint для обновления расписания (только админ)
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.put(
  '/doctors/:doctorId',
  [
    param('doctorId').isUUID().withMessage('Некорректный ID доктора'),
    body('schedule').isObject().withMessage('Расписание должно быть объектом'),
    handleValidationErrors,
  ],
  scheduleController.updateSchedule.bind(scheduleController)
);

module.exports = router;
