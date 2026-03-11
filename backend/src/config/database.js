const { PrismaClient } = require('@prisma/client');

// Создаем единственный экземпляр Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Проверка доступности моделей при инициализации
if (process.env.NODE_ENV === 'development') {
  const models = Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_'));
  console.log('Доступные модели Prisma:', models);
  if (!prisma.review) {
    console.error('⚠️  ВНИМАНИЕ: Модель "review" не найдена в Prisma Client!');
    console.error('   Запустите: npx prisma generate');
  }
}

// Обработка graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
