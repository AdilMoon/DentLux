const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const AppError = require('../utils/errors');

class ClientService {
  // Получить всех клиентов
  async getAllClients() {
    const clients = await userRepository.findAllClients();
    return clients.map(client => ({
      id: client.id,
      name: client.fullName,
      email: client.email,
      phone: client.phone,
      createdAt: client.createdAt,
    }));
  }

  // Создать клиента
  async createClient(data) {
    const { email, password, fullName, phone } = data;

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

    // Создаем клиента
    const user = await userRepository.create({
      email,
      passwordHash,
      role: 'CLIENT',
      fullName,
      phone,
    });

    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
    };
  }

  // Обновить клиента
  async updateClient(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Клиент не найден', 404);
    }

    if (user.role !== 'CLIENT') {
      throw new AppError('Пользователь не является клиентом', 400);
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

    const updated = await userRepository.update(userId, updateData);
    return {
      id: updated.id,
      name: updated.fullName,
      email: updated.email,
      phone: updated.phone,
    };
  }

  // Удалить клиента
  async deleteClient(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Клиент не найден', 404);
    }

    if (user.role !== 'CLIENT') {
      throw new AppError('Пользователь не является клиентом', 400);
    }

    await userRepository.delete(userId);
  }
}

module.exports = new ClientService();



