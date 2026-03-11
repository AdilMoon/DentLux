const auditLogService = require('../services/auditLogService');
const AppError = require('../utils/errors');

class AuditLogController {
  // Получить все логи
  async getAll(req, res, next) {
    try {
      const { userId, action, entityType, entityId, startDate, endDate, limit, skip } = req.query;

      const filters = {
        userId,
        action,
        entityType,
        entityId,
        startDate,
        endDate,
        limit: limit ? parseInt(limit) : 100,
        skip: skip ? parseInt(skip) : 0,
      };

      const logs = await auditLogService.getAllLogs(
        filters,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Получить логи пользователя
  async getUserLogs(req, res, next) {
    try {
      const { userId } = req.params;

      const logs = await auditLogService.getUserLogs(
        req.user.id,
        userId,
        req.user.role
      );

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Получить логи по сущности
  async getEntityLogs(req, res, next) {
    try {
      const { entityType, entityId } = req.params;

      const logs = await auditLogService.getEntityLogs(
        entityType,
        entityId,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Получить статистику
  async getStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const filters = { startDate, endDate };

      const stats = await auditLogService.getStatistics(
        filters,
        req.user.id,
        req.user.role
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }
}

module.exports = new AuditLogController();
