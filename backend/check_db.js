const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function checkConnection() {
  const prisma = new PrismaClient();
  console.log('--- Диагностика подключения к базе данных ---');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL.replace(/:([^:@/]+)@/, ':****@')}`); // Hide password in logs
  
  try {
    console.log('Попытка подключения к базе данных...');
    await prisma.$connect();
    console.log('✅ Успешно! Соединение с базой данных установлено.');
    
    const count = await prisma.user.count();
    console.log(`📊 Количество пользователей в базе: ${count}`);
    
  } catch (error) {
    console.error('❌ Ошибка подключения:');
    if (error.code === 'P2003') {
      console.error('Причина: Ошибка внешнего ключа (редко при подключении)');
    } else if (error.code === 'P1000') {
      console.error('Причина: Неверные учетные данные (Authentication failed).');
      console.error('   👉 Проверьте логин (postgres) и пароль в файле backend/.env');
    } else if (error.code === 'P1001') {
      console.error('Причина: База данных не запущена или порт 5432 закрыт.');
      console.error('   👉 Убедитесь, что PostgreSQL запущен (служба postgresql в Windows).');
    } else if (error.code === 'P1003') {
      console.error(`Причина: База данных '${process.env.DATABASE_URL.split('/').pop().split('?')[0]}' не найдена.`);
      console.error('   👉 Создайте базу данных с таким именем в pgAdmin или через psql.');
    } else {
      console.error(error.message);
    }
    console.log('\n💡 СОВЕТ: Если вы забыли пароль от PostgreSQL, вам нужно сбросить его в настройках сервера или переустановить PostgreSQL.');
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
