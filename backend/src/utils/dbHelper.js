const { getPool, sql } = require('../config/database');

// Вспомогательные функции для работы с SQL Server

/**
 * Выполнить запрос и вернуть первую строку
 */
const queryOne = async (queryText, params = {}) => {
  const pool = await getPool();
  const request = pool.request();
  
  // Добавить параметры с правильными типами
  Object.keys(params).forEach(key => {
    const value = params[key];
    let sqlType = sql.VarChar;
    
    if (value === null || value === undefined) {
      sqlType = sql.VarChar;
    } else if (typeof value === 'number') {
      sqlType = Number.isInteger(value) ? sql.Int : sql.Decimal(10, 2);
    } else if (value instanceof Date) {
      sqlType = sql.DateTime2;
    } else if (typeof value === 'boolean') {
      sqlType = sql.Bit;
    } else if (typeof value === 'string' && value.length > 255) {
      sqlType = sql.NVarChar(sql.MAX);
    } else if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      sqlType = sql.UniqueIdentifier;
    }
    
    request.input(key, sqlType, value);
  });
  
  const result = await request.query(queryText);
  return result.recordset[0] || null;
};

/**
 * Выполнить запрос и вернуть все строки
 */
const queryAll = async (queryText, params = {}) => {
  const pool = await getPool();
  const request = pool.request();
  
  // Добавить параметры с правильными типами
  Object.keys(params).forEach(key => {
    const value = params[key];
    let sqlType = sql.VarChar;
    
    if (value === null || value === undefined) {
      sqlType = sql.VarChar;
    } else if (typeof value === 'number') {
      sqlType = Number.isInteger(value) ? sql.Int : sql.Decimal(10, 2);
    } else if (value instanceof Date) {
      sqlType = sql.DateTime2;
    } else if (typeof value === 'boolean') {
      sqlType = sql.Bit;
    } else if (typeof value === 'string' && value.length > 255) {
      sqlType = sql.NVarChar(sql.MAX);
    } else if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      sqlType = sql.UniqueIdentifier;
    }
    
    request.input(key, sqlType, value);
  });
  
  const result = await request.query(queryText);
  return result.recordset || [];
};

/**
 * Выполнить INSERT с OUTPUT и вернуть вставленную строку
 */
const insertWithOutput = async (tableName, columns, values, outputColumns = '*') => {
  const pool = await getPool();
  const request = pool.request();
  
  // Создать параметры
  const paramNames = [];
  const columnNames = [];
  
  columns.forEach((col, index) => {
    const paramName = `param${index}`;
    paramNames.push(`@${paramName}`);
    columnNames.push(`[${col}]`);
    
    // Определить тип данных для параметра
    const value = values[index];
    let sqlType = sql.VarChar;
    
    if (value === null || value === undefined) {
      sqlType = sql.VarChar;
    } else if (typeof value === 'number') {
      sqlType = sql.Decimal(10, 2);
    } else if (value instanceof Date) {
      sqlType = sql.DateTime2;
    } else if (typeof value === 'boolean') {
      sqlType = sql.Bit;
    } else if (typeof value === 'string' && value.length > 255) {
      sqlType = sql.NVarChar(sql.MAX);
    } else if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      sqlType = sql.UniqueIdentifier;
    }
    
    request.input(paramName, sqlType, value);
  });
  
  const query = `
    INSERT INTO [${tableName}] (${columnNames.join(', ')})
    OUTPUT INSERTED.${outputColumns}
    VALUES (${paramNames.join(', ')})
  `;
  
  const result = await request.query(query);
  return result.recordset[0] || null;
};

/**
 * Выполнить UPDATE с OUTPUT
 */
const updateWithOutput = async (tableName, setClause, whereClause, params = {}, outputColumns = '*') => {
  const pool = await getPool();
  const request = pool.request();
  
  // Добавить параметры с правильными типами
  Object.keys(params).forEach(key => {
    const value = params[key];
    let sqlType = sql.VarChar;
    
    if (value === null || value === undefined) {
      sqlType = sql.VarChar;
    } else if (typeof value === 'number') {
      sqlType = sql.Decimal(10, 2);
    } else if (value instanceof Date) {
      sqlType = sql.DateTime2;
    } else if (typeof value === 'boolean') {
      sqlType = sql.Bit;
    } else if (typeof value === 'string' && value.length > 255) {
      sqlType = sql.NVarChar(sql.MAX);
    } else if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      sqlType = sql.UniqueIdentifier;
    }
    
    request.input(key, sqlType, value);
  });
  
  const query = `
    UPDATE [${tableName}]
    SET ${setClause}
    OUTPUT INSERTED.${outputColumns}
    WHERE ${whereClause}
  `;
  
  const result = await request.query(query);
  return result.recordset[0] || null;
};

/**
 * Получить количество записей
 * tableName может быть простой таблицей или JOIN запросом
 */
const count = async (tableName, whereClause = '', params = {}) => {
  const pool = await getPool();
  const request = pool.request();
  
  Object.keys(params).forEach(key => {
    request.input(key, params[key]);
  });
  
  const where = whereClause ? `WHERE ${whereClause}` : '';
  
  // Если tableName содержит JOIN, используем подзапрос
  let query;
  if (tableName.toUpperCase().includes('JOIN')) {
    query = `SELECT COUNT(*) as count FROM (SELECT 1 FROM ${tableName} ${where}) as subquery`;
  } else {
    query = `SELECT COUNT(*) as count FROM ${tableName} ${where}`;
  }
  
  const result = await request.query(query);
  return parseInt(result.recordset[0]?.count) || 0;
};

module.exports = {
  queryOne,
  queryAll,
  insertWithOutput,
  updateWithOutput,
  count,
  sql,
};
