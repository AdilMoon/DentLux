const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { param, body, query } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

// Публичные маршруты (не требуют аутентификации)
router.get(
  '/doctors/:doctorId',
  [
    param('doctorId').isUUID().withMessage('Некорректный ID доктора'),
    query('approvedOnly').optional().isBoolean().withMessage('approvedOnly должен быть boolean'),
    handleValidationErrors,
  ],
  reviewController.getDoctorReviews.bind(reviewController)
);

router.get(
  '/services/:serviceId',
  [
    param('serviceId').isUUID().withMessage('Некорректный ID услуги'),
    query('approvedOnly').optional().isBoolean().withMessage('approvedOnly должен быть boolean'),
    handleValidationErrors,
  ],
  reviewController.getServiceReviews.bind(reviewController)
);

// Защищенные маршруты
router.use(authMiddleware);

// Создать отзыв (доступно клиентам)
router.post(
  '/',
  roleMiddleware('CLIENT', 'ADMIN'),
  [
    body('appointmentId').isUUID().withMessage('Некорректный ID записи'),
    body('rating')
      .custom((value) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1 || numValue > 5) {
          throw new Error('Рейтинг 1-5 аралығында болуы керек');
        }
        return true;
      })
      .withMessage('Рейтинг 1-5 аралығында болуы керек'),
    body('comment').optional().isLength({ max: 2000 }).withMessage('Пікір тым ұзын'),
    handleValidationErrors,
  ],
  reviewController.create.bind(reviewController)
);

// Админские маршруты
router.use(roleMiddleware('ADMIN'));

router.get(
  '/',
  [
    query('approvedOnly').optional().isBoolean().withMessage('approvedOnly должен быть boolean'),
    handleValidationErrors,
  ],
  reviewController.getAll.bind(reviewController)
);

router.patch(
  '/:reviewId/approval',
  [
    param('reviewId').isUUID().withMessage('Некорректный ID отзыва'),
    body('isApproved').isBoolean().withMessage('isApproved должен быть boolean'),
    handleValidationErrors,
  ],
  reviewController.updateApprovalStatus.bind(reviewController)
);

// ПРИМЕЧАНИЕ: Маршрут DELETE для отзывов НЕ ДОЛЖЕН БЫТЬ ДОБАВЛЕН
// Отзывы не должны удаляться - только изменение статуса одобрения (isApproved)

module.exports = router;
