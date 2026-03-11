const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { param, query } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

// Все маршруты требуют аутентификации и прав админа
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Получить все логи с фильтрацией
router.get(
  '/',
  [
    query('userId').optional().isUUID().withMessage('Некорректный ID пользователя'),
    query('action').optional().isIn(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'CANCEL']).withMessage('Некорректное действие'),
    query('entityType').optional().isString().withMessage('Некорректный тип сущности'),
    query('entityId').optional().isUUID().withMessage('Некорректный ID сущности'),
    query('startDate').optional().isISO8601().withMessage('Некорректная дата начала'),
    query('endDate').optional().isISO8601().withMessage('Некорректная дата окончания'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit должен быть от 1 до 1000'),
    query('skip').optional().isInt({ min: 0 }).withMessage('Skip должен быть >= 0'),
    handleValidationErrors,
  ],
  auditLogController.getAll.bind(auditLogController)
);

// Получить логи пользователя
router.get(
  '/users/:userId',
  [
    param('userId').isUUID().withMessage('Некорректный ID пользователя'),
    handleValidationErrors,
  ],
  auditLogController.getUserLogs.bind(auditLogController)
);

// Получить логи по сущности
router.get(
  '/entities/:entityType/:entityId',
  [
    param('entityType').isString().withMessage('Некорректный тип сущности'),
    param('entityId').isUUID().withMessage('Некорректный ID сущности'),
    handleValidationErrors,
  ],
  auditLogController.getEntityLogs.bind(auditLogController)
);

// Получить статистику
router.get(
  '/statistics',
  [
    query('startDate').optional().isISO8601().withMessage('Некорректная дата начала'),
    query('endDate').optional().isISO8601().withMessage('Некорректная дата окончания'),
    handleValidationErrors,
  ],
  auditLogController.getStatistics.bind(auditLogController)
);

module.exports = router;
