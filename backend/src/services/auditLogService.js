const auditLogRepository = require('../repositories/auditLogRepository');
const AppError = require('../utils/errors');

class AuditLogService {
  // Получить все логи (только для админа)
  async getAllLogs(filters, userId, userRole) {
    if (userRole !== 'ADMIN') {
      throw new AppError('Рұқсат жоқ', 403);
    }

    return await auditLogRepository.findAll(filters);
  }

  // Получить логи пользователя
  async getUserLogs(userId, targetUserId, userRole) {
    // Пользователь может видеть только свои логи, админ - любые
    if (userRole !== 'ADMIN' && userId !== targetUserId) {
      throw new AppError('Рұқсат жоқ', 403);
    }

    return await auditLogRepository.findByUserId(targetUserId);
  }

  // Получить логи по сущности (только для админа)
  async getEntityLogs(entityType, entityId, userId, userRole) {
    if (userRole !== 'ADMIN') {
      throw new AppError('Рұқсат жоқ', 403);
    }

    return await auditLogRepository.findByEntity(entityType, entityId);
  }

  // Получить статистику (только для админа)
  async getStatistics(filters, userId, userRole) {
    if (userRole !== 'ADMIN') {
      throw new AppError('Рұқсат жоқ', 403);
    }

    return await auditLogRepository.getStatistics(filters);
  }
}

module.exports = new AuditLogService();
