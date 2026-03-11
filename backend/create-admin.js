// Скрипт для создания администраторского аккаунта
require('dotenv').config();
const bcrypt = require('bcrypt');
const { getPool } = require('./src/config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('🔐 Создание администраторского аккаунта\n');

    // Получить данные от пользователя (или из аргументов командной строки)
    let email, password, fullName, phone;

    if (process.argv.length >= 5) {
      // Использовать аргументы командной строки
      email = process.argv[2];
      password = process.argv[3];
      fullName = process.argv[4];
      phone = process.argv[5] || '';
      console.log(`Email: ${email}`);
      console.log(`Пароль: ${'*'.repeat(password.length)}`);
      console.log(`Имя: ${fullName}`);
      if (phone) console.log(`Телефон: ${phone}`);
    } else {
      // Интерактивный режим
      email = await question('Email: ');
      password = await question('Пароль: ');
      fullName = await question('Полное имя: ');
      phone = await question('Телефон (необязательно, нажмите Enter для пропуска): ');
    }

    if (!email || !password || !fullName) {
      console.error('❌ Email, пароль и имя обязательны!');
      console.error('\nИспользование:');
      console.error('  node create-admin.js');
      console.error('  node create-admin.js <email> <password> <fullName> [phone]');
      rl.close();
      process.exit(1);
    }

    console.log('\n⏳ Создание аккаунта...');

    // Подключение к базе данных
    const pool = await getPool();
    const sql = require('mssql');

    // Проверка существования пользователя
    const checkRequest = pool.request();
    checkRequest.input('email', sql.NVarChar(255), email.toLowerCase().trim());
    const existingUser = await checkRequest.query('SELECT * FROM users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      console.error('❌ Пользователь с таким email уже существует!');
      rl.close();
      process.exit(1);
    }

    // Хэширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание администратора
    const request = pool.request();
    request.input('email', sql.NVarChar(255), email.toLowerCase().trim());
    request.input('passwordHash', sql.NVarChar(255), passwordHash);
    request.input('role', sql.NVarChar(20), 'ADMIN');
    request.input('fullName', sql.NVarChar(255), fullName.trim());
    request.input('phone', sql.NVarChar(50), phone.trim() || null);
    
    const result = await request.query(`
      INSERT INTO users (email, password_hash, role, full_name, phone)
      OUTPUT INSERTED.id, INSERTED.email, INSERTED.role, INSERTED.full_name, INSERTED.phone, INSERTED.created_at
      VALUES (@email, @passwordHash, @role, @fullName, @phone)
    `);

    const admin = result.recordset[0];

    console.log('\n✅ Администраторский аккаунт успешно создан!');
    console.log('\n📋 Данные аккаунта:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Имя: ${admin.full_name}`);
    console.log(`   Телефон: ${admin.phone || 'не указан'}`);
    console.log(`   Роль: ${admin.role}`);
    console.log(`   Создан: ${admin.created_at}`);
    console.log('\n💡 Теперь вы можете войти в систему с этим email и паролем!');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Ошибка при создании администратора:');
    console.error(`   ${error.message}`);
    if (error.stack) {
      console.error('\nДетали:');
      console.error(error.stack);
    }
    rl.close();
    process.exit(1);
  }
}

// Запуск
createAdmin();
