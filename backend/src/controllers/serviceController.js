const serviceService = require('../services/serviceService');

class ServiceController {
  // Получить все услуги (публичный endpoint)
  async getAll(req, res, next) {
    try {
      const services = await serviceService.getAllServices();
      res.json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить все услуги для админа (включая неактивные)
  async getAllForAdmin(req, res, next) {
    try {
      const services = await serviceService.getAllServicesForAdmin();
      res.json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  // Создать услугу
  async create(req, res, next) {
    try {
      const service = await serviceService.createService(req.body);
      res.status(201).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновить услугу
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const service = await serviceService.updateService(id, req.body);
      res.json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  // Удалить услугу
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await serviceService.deleteService(id);
      res.json({
        success: true,
        message: 'Услуга удалена',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceController();



