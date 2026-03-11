const refundService = require('../services/refundService');
const roleMiddleware = require('../middlewares/roleMiddleware');

class RefundController {
  // Создать возврат
  async create(req, res, next) {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      const refund = await refundService.createRefund(
        paymentId,
        reason,
        req.user.id
      );
      res.status(201).json({
        success: true,
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить мои возвраты
  async getMy(req, res, next) {
    try {
      const refunds = await refundService.getMyRefunds(req.user.id);
      res.json({
        success: true,
        data: refunds,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить все возвраты (только админ)
  async getAll(req, res, next) {
    try {
      const refunds = await refundService.getAllRefunds();
      res.json({
        success: true,
        data: refunds,
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновить возврат (только админ)
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const refund = await refundService.updateRefund(
        id,
        status,
        adminNotes,
        req.user.id
      );
      res.json({
        success: true,
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RefundController();



