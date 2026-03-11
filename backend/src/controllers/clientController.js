const clientService = require('../services/clientService');

class ClientController {
  // Получить всех клиентов
  async getAll(req, res, next) {
    try {
      const clients = await clientService.getAllClients();
      res.status(200).json({
        success: true,
        data: clients,
      });
    } catch (error) {
      next(error);
    }
  }

  // Создать клиента
  async create(req, res, next) {
    try {
      const client = await clientService.createClient(req.body);
      res.status(201).json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновить клиента
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const client = await clientService.updateClient(id, req.body);
      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  // Удалить клиента
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await clientService.deleteClient(id);
      res.json({
        success: true,
        message: 'Клиент удален',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientController();



