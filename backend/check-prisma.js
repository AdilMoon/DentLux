// Скрипт для проверки Prisma Client
const prisma = require('./src/config/database');

console.log('=== Проверка Prisma Client ===');
console.log('Prisma client загружен:', !!prisma);
console.log('');

if (prisma) {
  const models = Object.keys(prisma).filter(key => 
    !key.startsWith('$') && 
    !key.startsWith('_') && 
    typeof prisma[key] === 'object' &&
    prisma[key] !== null
  );
  
  console.log('Доступные модели:', models);
  console.log('');
  console.log('Модель review существует:', !!prisma.review);
  console.log('Модель appointment существует:', !!prisma.appointment);
  console.log('Модель user существует:', !!prisma.user);
  
  if (!prisma.review) {
    console.error('');
    console.error('❌ ОШИБКА: Модель review не найдена!');
    console.error('   Запустите: npx prisma generate');
    process.exit(1);
  } else {
    console.log('');
    console.log('✅ Модель review найдена!');
    console.log('Методы модели review:', Object.keys(prisma.review).slice(0, 10).join(', '), '...');
  }
} else {
  console.error('❌ Prisma client не загружен!');
  process.exit(1);
}

process.exit(0);
