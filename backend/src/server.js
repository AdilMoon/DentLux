require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

function getDatabaseInfo() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return 'DATABASE_URL not set';

  try {
    const url = new URL(databaseUrl);
    return `${url.hostname}:${url.port || '5432'}/${url.pathname.replace('/', '')}`;
  } catch (error) {
    return 'DATABASE_URL is invalid';
  }
}

// Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен по адресу: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 База данных: ${getDatabaseInfo()}`);
});

// Обработка завершения процесса
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
