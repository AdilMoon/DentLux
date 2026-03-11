const clientBlockService = require('../services/clientBlockService');
const AppError = require('../utils/errors');

class ClientBlockController {
  // Заблокировать клиента
  async blockClient(req, res, next) {
    try {
      const { clientId } = req.params;
      const { reason, appointmentId } = req.body;

      const block = await clientBlockService.blockClient(
        clientId,
        req.user.id,
        reason,
        appointmentId
      );

      res.status(201).json({
        success: true,
        data: block,
        message: 'Клиент заблокирован',
      });
    } catch (error) {
      next(error);
    }
  }

  // Разблокировать клиента
  async unblockClient(req, res, next) {
    try {
      const { id } = req.params;
      const block = await clientBlockService.unblockClient(id, req.user.id);

      res.json({
        success: true,
        data: block,
        message: 'Клиент разблокирован',
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить все активные блокировки
  async getActiveBlocks(req, res, next) {
    try {
      const blocks = await clientBlockService.getActiveBlocks();
      res.json({
        success: true,
        data: blocks,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить блокировки клиента
  async getClientBlocks(req, res, next) {
    try {
      const { clientId } = req.params;
      const blocks = await clientBlockService.getClientBlocks(clientId);
      res.json({
        success: true,
        data: blocks,
      });
    } catch (error) {
      next(error);
    }
  }

  // Проверить, заблокирован ли клиент
  async checkBlockStatus(req, res, next) {
    try {
      const clientId = req.user.role === 'ADMIN' ? req.params.clientId : req.user.id;
      const isBlocked = await clientBlockService.isClientBlocked(clientId);

      res.json({
        success: true,
        data: { isBlocked },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientBlockController();
