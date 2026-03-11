const doctorRepository = require('../repositories/doctorRepository');
const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const AppError = require('../utils/errors');

class DoctorService {
  // Получить всех докторов
  async getAllDoctors(excludeBlocked = false) {
    let doctors = await doctorRepository.findAll();
    
    // Фильтруем заблокированных докторов, если требуется
    if (excludeBlocked) {
      doctors = doctors.filter(doctor => {
        // Проверяем, заблокирован ли доктор
        if (!doctor.isBlocked) {
          return true;
        }
        // Если есть срок блокировки, проверяем, не истек ли он
        if (doctor.blockedUntil) {
          return new Date(doctor.blockedUntil) <= new Date();
        }
        // Если заблокирован без срока, не показываем
        return false;
      });
    }
    
    // Преобразуем в формат, ожидаемый фронтендом
    return doctors.map(doctor => ({
      id: doctor.user.id,
      name: doctor.user.fullName, // фронтенд ожидает 'name'
      email: doctor.user.email,
      phone: doctor.user.phone,
      specialization: doctor.specialization || 'Не указано',
      experienceYears: doctor.experienceYears,
      workSchedule: doctor.workSchedule ? JSON.parse(doctor.workSchedule) : null,
      isBlocked: doctor.isBlocked || false,
      blockedUntil: doctor.blockedUntil,
      avatarUrl: doctor.user.avatarUrl || null,
    }));
  }

  // Создать доктора
  async createDoctor(data) {
    const { email, password, fullName, phone, specialization, experienceYears, workSchedule } = data;

    // Валидация
    if (!email || !password || !fullName) {
      throw new AppError('Email, пароль и ФИО обязательны', 400);
    }

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Пользователь с таким email уже существует', 400);
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем доктора
    const doctor = await doctorRepository.create(
      {
        email,
        passwordHash,
        fullName,
        phone,
      },
      {
        specialization,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        workSchedule,
      }
    );

    return this.formatDoctor(doctor);
  }

  // Обновить доктора
  async updateDoctor(userId, data) {
    const doctor = await doctorRepository.findById(userId);
    if (!doctor) {
      throw new AppError('Доктор не найден', 404);
    }

    const updateData = {};

    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.email !== undefined) {
      // Проверяем, не занят ли email другим пользователем
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Email уже используется', 400);
      }
      updateData.email = data.email;
    }
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }
    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.experienceYears !== undefined) {
      updateData.experienceYears = data.experienceYears ? parseInt(data.experienceYears) : null;
    }
    if (data.workSchedule !== undefined) updateData.workSchedule = data.workSchedule;

    const updated = await doctorRepository.update(userId, updateData);
    return this.formatDoctor(updated);
  }

  // Удалить доктора
  async deleteDoctor(userId) {
    const doctor = await doctorRepository.findById(userId);
    if (!doctor) {
      throw new AppError('Доктор не найден', 404);
    }

    await doctorRepository.delete(userId);
  }

  // Заблокировать доктора
  async blockDoctor(userId, blockedUntil = null) {
    const doctor = await doctorRepository.findById(userId);
    if (!doctor) {
      throw new AppError('Доктор не найден', 404);
    }

    const blocked = await doctorRepository.blockDoctor(userId, blockedUntil);
    return this.formatDoctor(blocked);
  }

  // Разблокировать доктора
  async unblockDoctor(userId) {
    const doctor = await doctorRepository.findById(userId);
    if (!doctor) {
      throw new AppError('Доктор не найден', 404);
    }

    const unblocked = await doctorRepository.unblockDoctor(userId);
    return this.formatDoctor(unblocked);
  }

  // Проверить, заблокирован ли доктор
  async isDoctorBlocked(userId) {
    return await doctorRepository.isDoctorBlocked(userId);
  }

  // Форматировать доктора для фронтенда
  formatDoctor(doctor) {
    return {
      id: doctor.user.id,
      name: doctor.user.fullName,
      email: doctor.user.email,
      phone: doctor.user.phone,
      specialization: doctor.specialization || 'Не указано',
      experienceYears: doctor.experienceYears,
      workSchedule: doctor.workSchedule ? JSON.parse(doctor.workSchedule) : null,
      avatarUrl: doctor.user.avatarUrl || null,
      isBlocked: doctor.isBlocked || false,
      blockedUntil: doctor.blockedUntil,
    };
  }
}

module.exports = new DoctorService();
