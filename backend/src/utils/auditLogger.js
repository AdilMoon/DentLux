const prisma = require('../config/database');

/**
 * Сервис для логирования действий пользователей
 */
class AuditLogger {
  /**
   * Логировать действие
   */
  async log(data) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId || null,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId || null,
          changes: data.changes ? JSON.stringify(data.changes) : null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
      });
    } catch (error) {
      // Не выбрасываем ошибку, чтобы не нарушить основной процесс
      console.error('Audit log error:', error);
    }
  }

  /**
   * Логировать создание сущности
   */
  async logCreate(userId, entityType, entityId, data = null, req = null) {
    await this.log({
      userId,
      action: 'CREATE',
      entityType,
      entityId,
      changes: data ? { new: data } : null,
      ipAddress: req?.ip || req?.socket?.remoteAddress || null,
      userAgent: req?.get?.('user-agent') || null,
    });
  }

  /**
   * Логировать обновление сущности
   */
  async logUpdate(userId, entityType, entityId, oldData, newData, req = null) {
    await this.log({
      userId,
      action: 'UPDATE',
      entityType,
      entityId,
      changes: { old: oldData, new: newData },
      ipAddress: req?.ip || req?.socket?.remoteAddress || null,
      userAgent: req?.get?.('user-agent') || null,
    });
  }

  /**
   * Логировать удаление сущности
   */
  async logDelete(userId, entityType, entityId, data = null, req = null) {
    await this.log({
      userId,
      action: 'DELETE',
      entityType,
      entityId,
      changes: data ? { old: data } : null,
      ipAddress: req?.ip || req?.socket?.remoteAddress || null,
      userAgent: req?.get?.('user-agent') || null,
    });
  }

  /**
   * Логировать вход пользователя
   */
  async logLogin(userId, req = null) {
    await this.log({
      userId,
      action: 'LOGIN',
      entityType: 'User',
      entityId: userId,
      ipAddress: req?.ip || req?.socket?.remoteAddress || null,
      userAgent: req?.get?.('user-agent') || null,
    });
  }

  /**
   * Логировать выход пользователя
   */
  async logLogout(userId, req = null) {
    await this.log({
      userId,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: userId,
      ipAddress: req?.ip || req?.socket?.remoteAddress || null,
      userAgent: req?.get?.('user-agent') || null,
    });
  }

  /**
   * Логировать одобрение/отклонение
   */
  async logApproval(userId, entityType, entityId, approved, req = null) {
    await this.log({
      userId,
      action: approved ? 'APPROVE' : 'REJECT',
      entityType,
      entityId,
      ipAddress: req?.ip || req?.socket?.remoteAddress || null,
      userAgent: req?.get?.('user-agent') || null,
    });
  }

  /**
   * Логировать отмену
   */
  async logCancel(userId, entityType, entityId, data = null, req = null) {
    await this.log({
      userId,
      action: 'CANCEL',
      entityType,
      entityId,
      changes: data ? { old: data } : null,
      ipAddress: req?.ip || req?.socket?.remoteAddress || null,
      userAgent: req?.get?.('user-agent') || null,
    });
  }
}

module.exports = new AuditLogger();
