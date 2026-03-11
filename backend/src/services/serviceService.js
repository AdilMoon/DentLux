const serviceRepository = require('../repositories/serviceRepository');
const AppError = require('../utils/errors');

class ServiceService {
  // Получить все услуги (публичный)
  async getAllServices() {
    return await serviceRepository.findAll();
  }

  // Получить все услуги для админа (включая неактивные)
  async getAllServicesForAdmin() {
    return await serviceRepository.findAllForAdmin();
  }

  // Получить услугу по ID
  async getServiceById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new AppError('Услуга не найдена', 404);
    }
    return service;
  }

  // Создать услугу
  async createService(data) {
    // Валидация
    if (!data.name || !data.price) {
      throw new AppError('Название и цена обязательны', 400);
    }

    if (data.price < 0) {
      throw new AppError('Цена не может быть отрицательной', 400);
    }

    return await serviceRepository.create(data);
  }

  // Обновить услугу
  async updateService(id, data) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new AppError('Услуга не найдена', 404);
    }

    if (data.price !== undefined && data.price < 0) {
      throw new AppError('Цена не может быть отрицательной', 400);
    }

    return await serviceRepository.update(id, data);
  }

  // Удалить услугу
  async deleteService(id) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new AppError('Услуга не найдена', 404);
    }

    // Проверяем, нет ли активных записей на эту услугу
    const { appointmentsApi } = require('../repositories/appointmentRepository');
    // Можно добавить проверку, если нужно

    return await serviceRepository.delete(id);
  }
}

module.exports = new ServiceService();



