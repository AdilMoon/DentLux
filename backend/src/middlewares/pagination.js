const { query } = require('express-validator');
const { ValidationError } = require('../utils/errors');

// Валидация query параметров для пагинации
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Страница должна быть положительным числом'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Размер страницы должен быть от 1 до 100'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset должен быть неотрицательным числом'),
];

// Middleware для извлечения параметров пагинации
const getPaginationParams = (req) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || (page - 1) * pageSize;

  return {
    page,
    pageSize,
    limit: pageSize,
    offset,
  };
};

// Форматирование ответа с пагинацией
const formatPaginatedResponse = (data, total, pagination) => {
  return {
    data,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
      hasNext: pagination.page * pagination.pageSize < total,
      hasPrev: pagination.page > 1,
    },
  };
};

module.exports = {
  paginationValidation,
  getPaginationParams,
  formatPaginatedResponse,
};
