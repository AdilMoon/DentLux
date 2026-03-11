const prisma = require('../config/database');

class UserRepository {
  // Пайдаланушыны email бойынша табу
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });
  }

  // Пайдаланушыны ID бойынша табу
  async findById(id) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  // Жаңа пайдаланушыны қосу
  async create(userData) {
    const { email, passwordHash, role, firstName, lastName, phone, fullName } = userData;
    
    // Используем fullName если передан, иначе комбинируем firstName и lastName
    const finalFullName = fullName || `${firstName || ''} ${lastName || ''}`.trim();
    
    return await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: role || 'CLIENT',
        fullName: finalFullName,
        phone: phone || null,
      },
    });
  }

  // Получить всех клиентов (роль CLIENT)
  async findAllClients() {
    return await prisma.user.findMany({
      where: {
        role: 'CLIENT',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Обновить пользователя
  async update(id, userData) {
    const updateData = {};
    if (userData.email !== undefined) updateData.email = userData.email.toLowerCase().trim();
    if (userData.fullName !== undefined) updateData.fullName = userData.fullName;
    if (userData.phone !== undefined) updateData.phone = userData.phone || null;
    if (userData.passwordHash !== undefined) updateData.passwordHash = userData.passwordHash;
    if (userData.avatarUrl !== undefined) updateData.avatarUrl = userData.avatarUrl;

    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  // Удалить пользователя
  async delete(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  // Дәрігерді қосу
  async createDoctor(userId, doctorData) {
    const { specialization, licenseNumber, workSchedule } = doctorData;
    
    return await prisma.doctor.create({
      data: {
        userId,
        specialization: specialization || null,
        experienceYears: null, // Можно добавить в doctorData если нужно
        workSchedule: workSchedule ? JSON.stringify(workSchedule) : null,
      },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });
  }

  // Дәрігерді user_id бойынша табу
  async findDoctorByUserId(userId) {
    return await prisma.doctor.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });
  }

  // Создать токен сброса пароля
  async createPasswordResetToken(userId, token, expiresAt) {
    // Удаляем старые неиспользованные токены для этого пользователя
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId,
        used: false,
      },
    });

    return await prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  // Найти токен сброса пароля
  async findPasswordResetToken(token) {
    return await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
  }

  // Отметить токен как использованный
  async markPasswordResetTokenAsUsed(token) {
    return await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });
  }

  // Обновить пароль пользователя
  async updatePassword(userId, passwordHash) {
    return await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}

module.exports = new UserRepository();
