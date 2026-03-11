const prisma = require('../config/database');

class DoctorRepository {
  // Получить всех докторов
  async findAll() {
    return await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  // Найти доктора по ID
  async findById(id) {
    return await prisma.doctor.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  // Найти доктора по userId
  async findByUserId(userId) {
    return await prisma.doctor.findUnique({
      where: { userId },
    });
  }

  // Обновить расписание доктора
  async updateSchedule(doctorId, schedule) {
    return await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        workSchedule: JSON.stringify(schedule),
      },
    });
  }

  // Создать доктора (создает пользователя и запись доктора)
  async create(userData, doctorData) {
    return await prisma.doctor.create({
      data: {
        user: {
          create: {
            email: userData.email,
            passwordHash: userData.passwordHash,
            role: 'DOCTOR',
            fullName: userData.fullName,
            phone: userData.phone,
          },
        },
        specialization: doctorData.specialization || null,
        experienceYears: doctorData.experienceYears || null,
        workSchedule: doctorData.workSchedule ? JSON.stringify(doctorData.workSchedule) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  // Заблокировать доктора
  async blockDoctor(userId, blockedUntil = null) {
    const doctor = await this.findByUserId(userId);
    if (!doctor) {
      throw new Error('Доктор не найден');
    }
    
    return await prisma.doctor.update({
      where: { userId },
      data: {
        isBlocked: true,
        blockedUntil: blockedUntil || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  // Разблокировать доктора
  async unblockDoctor(userId) {
    const doctor = await this.findByUserId(userId);
    if (!doctor) {
      throw new Error('Доктор не найден');
    }
    
    return await prisma.doctor.update({
      where: { userId },
      data: {
        isBlocked: false,
        blockedUntil: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  // Проверить, заблокирован ли доктор
  async isDoctorBlocked(userId) {
    const doctor = await this.findByUserId(userId);
    if (!doctor) {
      return false;
    }
    
    if (!doctor.isBlocked) {
      return false;
    }
    
    // Если есть срок блокировки, проверяем, не истек ли он
    if (doctor.blockedUntil) {
      return new Date(doctor.blockedUntil) > new Date();
    }
    
    return true;
  }

  // Обновить доктора
  async update(userId, doctorData) {
    // Сначала обновляем пользователя, если есть данные пользователя
    const userUpdateData = {};
    if (doctorData.fullName !== undefined) {
      userUpdateData.fullName = doctorData.fullName;
    }
    if (doctorData.email !== undefined) {
      userUpdateData.email = doctorData.email;
    }
    if (doctorData.phone !== undefined) {
      userUpdateData.phone = doctorData.phone;
    }
    if (doctorData.passwordHash !== undefined) {
      userUpdateData.passwordHash = doctorData.passwordHash;
    }

    // Обновляем пользователя если есть изменения
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    // Затем обновляем данные доктора
    const doctorUpdateData = {};
    if (doctorData.specialization !== undefined) {
      doctorUpdateData.specialization = doctorData.specialization || null;
    }
    if (doctorData.experienceYears !== undefined) {
      doctorUpdateData.experienceYears = doctorData.experienceYears || null;
    }
    if (doctorData.workSchedule !== undefined) {
      doctorUpdateData.workSchedule = doctorData.workSchedule ? JSON.stringify(doctorData.workSchedule) : null;
    }

    // Обновляем доктора если есть изменения
    if (Object.keys(doctorUpdateData).length > 0) {
      await prisma.doctor.update({
        where: { userId },
        data: doctorUpdateData,
      });
    }

    // Возвращаем обновленного доктора
    return await prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  // Удалить доктора (удалит и пользователя каскадно)
  async delete(userId) {
    return await prisma.doctor.delete({
      where: { userId },
    });
  }

  // Обновить расписание доктора
  async updateSchedule(doctorId, schedule) {
    return await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        workSchedule: JSON.stringify(schedule),
      },
    });
  }
}

module.exports = new DoctorRepository();

