const prisma = require('../config/database');
const AppError = require('../utils/errors');

class ReviewRepository {
  // Создать отзыв
  async create(data) {
    try {
      return await prisma.review.create({
      data: {
        appointmentId: data.appointmentId,
        clientId: data.clientId,
        doctorId: data.doctorId || null,
        serviceId: data.serviceId || null,
        rating: data.rating,
        comment: data.comment || null,
        isApproved: data.isApproved || false,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
          },
        },
      },
    });
    } catch (error) {
      console.error('Ошибка в reviewRepository.create:', error);
      if (error.message && error.message.includes('findUnique')) {
        console.error('Prisma client состояние:', {
          prismaExists: !!prisma,
          reviewModelExists: !!prisma?.review,
        });
      }
      throw error;
    }
  }

  // Найти отзыв по appointmentId
  async findByAppointmentId(appointmentId) {
    if (!prisma || !prisma.review) {
      throw new Error('Модель Review не найдена в Prisma Client. Запустите: npx prisma generate');
    }
    
    try {
      return await prisma.review.findUnique({
      where: { appointmentId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    } catch (error) {
      console.error('Ошибка в reviewRepository.findByAppointmentId:', error);
      throw error;
    }
  }

  // Получить отзывы доктора
  async findByDoctorId(doctorId, approvedOnly = true) {
    const where = { doctorId };
    if (approvedOnly) {
      where.isApproved = true;
    }

    return await prisma.review.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Получить отзывы услуги
  async findByServiceId(serviceId, approvedOnly = true) {
    const where = { serviceId };
    if (approvedOnly) {
      where.isApproved = true;
    }

    return await prisma.review.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Получить все отзывы (для админа)
  async findAll(approvedOnly = false) {
    const where = approvedOnly ? { isApproved: true } : {};

    return await prisma.review.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Обновить статус одобрения отзыва
  async updateApprovalStatus(reviewId, isApproved) {
    return await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Получить средний рейтинг доктора
  async getDoctorAverageRating(doctorId) {
    const result = await prisma.review.aggregate({
      where: {
        doctorId,
        isApproved: true,
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.id || 0,
    };
  }

  // Получить средний рейтинг услуги
  async getServiceAverageRating(serviceId) {
    const result = await prisma.review.aggregate({
      where: {
        serviceId,
        isApproved: true,
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.id || 0,
    };
  }
}

// ПРИМЕЧАНИЕ: Удаление отзывов НЕ РЕАЛИЗОВАНО и НЕ ДОЛЖНО БЫТЬ ДОБАВЛЕНО
// Отзывы не должны удаляться - только изменение статуса одобрения (isApproved)

module.exports = new ReviewRepository();
