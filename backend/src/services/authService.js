const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const emailService = require('../utils/emailService');
const AppError = require('../utils/errors');

class AuthService {
  // Тіркелу
  async register(userData) {
    const { email, password, role, firstName, lastName, phone, fullName } = userData;

    // Email бойынша тексеру
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Бұл email бойынша пайдаланушы бар', 400);
    }

    // Рөлді анықтау - егер көрсетілмесе, CLIENT болады (админ кейінірек өзгертеді)
    const userRole = role || 'CLIENT';

    // fullName-ды firstName және lastName-ке бөлу
    let finalFirstName = firstName;
    let finalLastName = lastName;
    
    if (fullName && !firstName && !lastName) {
      const nameParts = fullName.trim().split(/\s+/);
      finalFirstName = nameParts[0] || '';
      finalLastName = nameParts.slice(1).join(' ') || '';
    }

    // Парольді хэштеу
    const passwordHash = await bcrypt.hash(password, 10);

    // Пайдаланушыны қосу
    const user = await userRepository.create({
      email,
      passwordHash,
      role: userRole,
      firstName: finalFirstName,
      lastName: finalLastName,
      fullName: fullName || `${finalFirstName} ${finalLastName}`.trim(),
      phone,
    });

    // Егер дәрігер болса, doctors кестесіне қосу
    if (userRole === 'DOCTOR') {
      const { specialization, licenseNumber, workSchedule } = userData;
      await userRepository.createDoctor(user.id, {
        specialization,
        licenseNumber,
        workSchedule: workSchedule || {},
      });
    }

    // JWT токенді генерациялау
    const token = this.generateToken(user.id, user.email, user.role);

    // Используем fullName из БД (Prisma возвращает camelCase) или формируем из firstName и lastName
    const finalFullName = user.fullName || fullName || `${finalFirstName} ${finalLastName}`.trim();

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: finalFullName,
      },
      token,
    };
  }

  // Кіру
  async login(email, password) {
    // Пайдаланушыны табу
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email немесе пароль дұрыс емес', 401);
    }

    // Парольді тексеру (Prisma возвращает passwordHash в camelCase)
    if (!user.passwordHash) {
      throw new AppError('Email немесе пароль дұрыс емес', 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Email немесе пароль дұрыс емес', 401);
    }

    // JWT токенді генерациялау
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.fullName, // Prisma возвращает fullName в camelCase
      },
      token,
    };
  }

  // JWT токенді генерациялау
  generateToken(userId, email, role) {
    return jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

}

module.exports = new AuthService();
