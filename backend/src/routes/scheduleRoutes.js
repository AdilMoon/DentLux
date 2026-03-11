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
