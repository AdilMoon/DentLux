const reviewRepository = require('../repositories/reviewRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const AppError = require('../utils/errors');

class ReviewService {
  // Создать отзыв
  async createReview(data, userId, userRole) {
    try {
      // Проверяем, что запись существует
      const appointment = await appointmentRepository.findById(data.appointmentId);
      if (!appointment) {
        throw new AppError('Жазылу табылмады', 404);
      }

    // Проверяем права доступа - только клиент может оставить отзыв на свою запись
    if (userRole === 'CLIENT' && appointment.clientId !== userId) {
      throw new AppError('Рұқсат жоқ', 403);
    }

    // Проверяем, нет ли уже отзыва для этой записи
    const existingReview = await reviewRepository.findByAppointmentId(data.appointmentId);
    if (existingReview) {
      throw new AppError('Бұл жазылуға отзыв қосылған', 409);
    }

    // Валидация рейтинга
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError('Рейтинг 1-5 аралығында болуы керек', 400);
    }

    // Валидация комментария
    if (data.comment && data.comment.length > 2000) {
      throw new AppError('Пікір тым ұзын (макс 2000 символ)', 400);
    }

    // Автоматически одобряем отзывы (можно изменить на false для модерации)
    const isApproved = true; // Или false, если нужна модерация

      return await reviewRepository.create({
        appointmentId: data.appointmentId,
        clientId: appointment.clientId,
        doctorId: appointment.doctorId,
        serviceId: appointment.serviceId,
        rating: data.rating,
        comment: data.comment || null,
        isApproved,
      });
    } catch (error) {
      console.error('Ошибка при создании отзыва:', error);
      if (error.message && error.message.includes('findUnique')) {
        throw new AppError('База данных қатесі: Prisma client не инициализирован', 500);
      }
      throw error;
    }
  }

  // Получить отзывы доктора
  async getDoctorReviews(doctorId, approvedOnly = true) {
    return await reviewRepository.findByDoctorId(doctorId, approvedOnly);
  }

  // Получить отзывы услуги
  async getServiceReviews(serviceId, approvedOnly = true) {
    return await reviewRepository.findByServiceId(serviceId, approvedOnly);
  }

  // Получить все отзывы (для админа)
  async getAllReviews(approvedOnly = false, userId, userRole) {
    if (userRole !== 'ADMIN') {
      throw new AppError('Рұқсат жоқ', 403);
    }

    return await reviewRepository.findAll(approvedOnly);
  }

  // Обновить статус одобрения отзыва (для админа)
  async updateApprovalStatus(reviewId, isApproved, userId, userRole) {
    if (userRole !== 'ADMIN') {
      throw new AppError('Рұқсат жоқ', 403);
    }

    return await reviewRepository.updateApprovalStatus(reviewId, isApproved);
  }

  // Получить статистику рейтингов доктора
  async getDoctorRatingStats(doctorId) {
    return await reviewRepository.getDoctorAverageRating(doctorId);
  }

  // Получить статистику рейтингов услуги
  async getServiceRatingStats(serviceId) {
    return await reviewRepository.getServiceAverageRating(serviceId);
  }
}

// ПРИМЕЧАНИЕ: Удаление отзывов НЕ РЕАЛИЗОВАНО и НЕ ДОЛЖНО БЫТЬ ДОБАВЛЕНО
// Отзывы не должны удаляться - только изменение статуса одобрения (isApproved)

module.exports = new ReviewService();
