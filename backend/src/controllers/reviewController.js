const reviewService = require('../services/reviewService');
const AppError = require('../utils/errors');

class ReviewController {
  // Создать отзыв
  async create(req, res, next) {
    try {
      const { appointmentId, rating, comment } = req.body;

      if (!appointmentId || rating === undefined || rating === null) {
        return res.status(400).json({
          success: false,
          error: 'Жазылу ID және рейтинг міндетті',
        });
      }

      // Преобразуем rating в число, если оно строка
      const ratingNumber = typeof rating === 'string' ? parseInt(rating, 10) : rating;
      
      if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
        return res.status(400).json({
          success: false,
          error: 'Рейтинг 1-5 аралығында болуы керек',
        });
      }

      const review = await reviewService.createReview(
        { appointmentId, rating: ratingNumber, comment: comment || undefined },
        req.user.id,
        req.user.role
      );

      res.status(201).json({
        success: true,
        data: review,
        message: 'Пікір қосылды',
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Получить отзывы доктора
  async getDoctorReviews(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { approvedOnly = 'true' } = req.query;

      const reviews = await reviewService.getDoctorReviews(
        doctorId,
        approvedOnly === 'true'
      );

      // Получаем статистику рейтингов
      const stats = await reviewService.getDoctorRatingStats(doctorId);

      res.json({
        success: true,
        data: {
          reviews,
          stats,
        },
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Получить отзывы услуги
  async getServiceReviews(req, res, next) {
    try {
      const { serviceId } = req.params;
      const { approvedOnly = 'true' } = req.query;

      const reviews = await reviewService.getServiceReviews(
        serviceId,
        approvedOnly === 'true'
      );

      // Получаем статистику рейтингов
      const stats = await reviewService.getServiceRatingStats(serviceId);

      res.json({
        success: true,
        data: {
          reviews,
          stats,
        },
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Получить все отзывы (для админа)
  async getAll(req, res, next) {
    try {
      const { approvedOnly = 'false' } = req.query;

      const reviews = await reviewService.getAllReviews(
        approvedOnly === 'true',
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Обновить статус одобрения отзыва (для админа)
  async updateApprovalStatus(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { isApproved } = req.body;

      if (typeof isApproved !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'isApproved должен быть boolean',
        });
      }

      const review = await reviewService.updateApprovalStatus(
        reviewId,
        isApproved,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: review,
        message: isApproved ? 'Пікір бекітілді' : 'Пікірдің бекітуі алынып тасталды',
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }
}

module.exports = new ReviewController();
