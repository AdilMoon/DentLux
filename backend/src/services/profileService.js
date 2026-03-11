const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const AppError = require('../utils/errors');

class ProfileService {
  // Получить профиль пользователя
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Пайдаланушы табылмады', 404);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || '',
      role: user.role,
      avatarUrl: user.avatarUrl || null,
    };
  }

  // Обновить профиль пользователя
  async updateProfile(userId, updateData) {
    const { fullName, phone, email, password } = updateData;

    // Проверяем, существует ли пользователь
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw new AppError('Пайдаланушы табылмады', 404);
    }

    // Если обновляется email, проверяем, что он не занят другим пользователем
    if (email && email !== existingUser.email) {
      const emailExists = await userRepository.findByEmail(email);
      if (emailExists && emailExists.id !== userId) {
        throw new AppError('Бұл email бойынша пайдаланушы бар', 400);
      }
    }

    // Подготавливаем данные для обновления
    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (phone !== undefined) updateFields.phone = phone || null;
    if (email !== undefined) updateFields.email = email.toLowerCase().trim();

    // Если предоставлен новый пароль, хэшируем его
    if (password) {
      // Валидация пароля (должен соответствовать требованиям)
      const letters = (password.match(/[a-zA-Zа-яА-ЯёЁәӘіІңҢғҒүҮұҰқҚөӨһҺ]/g) || []).length;
      const digits = (password.match(/\d/g) || []).length;
      const special = (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;

      if (password.length < 9) {
        throw new AppError('Пароль кемінде 9 символ болуы керек', 400);
      }
      if (letters < 6) {
        throw new AppError('Пароль кемінде 6 әріп болуы керек', 400);
      }
      if (digits < 2) {
        throw new AppError('Пароль кемінде 2 сан болуы керек', 400);
      }
      if (special < 1) {
        throw new AppError('Пароль кемінде 1 арнайы символ болуы керек', 400);
      }

      updateFields.passwordHash = await bcrypt.hash(password, 10);
    }

    // Обновляем пользователя
    const updatedUser = await userRepository.update(userId, updateFields);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone || '',
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl || null,
    };
  }

  // Обновить аватар пользователя
  async updateAvatar(userId, avatarUrl) {
    const updatedUser = await userRepository.update(userId, { avatarUrl });
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone || '',
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl || null,
    };
  }
}

module.exports = new ProfileService();
