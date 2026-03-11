// Скрипт для проверки подключения к SQL Server
require('dotenv').config();
const sql = require('mssql');
const path = require('path');
const fs = require('fs');

// Проверка существования .env файла
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Файл .env не найден!');
  console.error(`   Ожидаемый путь: ${envPath}`);
  console.error('\n💡 Создайте файл .env:');
  console.error('   1. Откройте папку backend');
  console.error('   2. Найдите файл env.example.txt');
  console.error('   3. Скопируйте его и переименуйте в .env (точка в начале!)');
  console.error('   4. Откройте .env и заполните все значения');
  console.error('\n   Или выполните в PowerShell:');
  console.error(`   Copy-Item "${path.join(__dirname, 'env.example.txt')}" "${envPath}"`);
  process.exit(1);
}

const useWindowsAuth = process.env.DB_TRUSTED_CONNECTION === 'true';

// Обработка имени сервера и экземпляра
let serverName = process.env.DB_HOST || 'ARSEN';
let instanceName = null;

// Проверяем, указан ли именованный экземпляр (например, ARSEN\SQLEXPRESS)
if (serverName.includes('\\')) {
  const parts = serverName.split('\\');
  serverName = parts[0];
  instanceName = parts[1];
}

const config = {
  server: serverName,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT !== 'false', // По умолчанию true (Mandatory encryption)
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false', // По умолчанию true
    enableArithAbort: true,
    trustedConnection: useWindowsAuth,
  },
  connectionTimeout: 15000,
  requestTimeout: 15000,
};

// Если указан именованный экземпляр, используем instanceName
if (instanceName) {
  config.options.instanceName = instanceName;
  // Не указываем port для именованного экземпляра - используется SQL Server Browser на порту 1434
} else {
  // Для дефолтного экземпляра указываем порт
  config.port = parseInt(process.env.DB_PORT) || 1433;
}

// Добавить user/password только если не используется Windows Auth
if (!useWindowsAuth) {
  config.user = process.env.DB_USER;
  config.password = process.env.DB_PASSWORD;
}

// Валидация обязательных переменных
if (!config.database) {
  console.error('❌ DB_NAME не установлен в .env файле!');
  console.error('   Установите DB_NAME=dentreserve_pro в файле .env');
  process.exit(1);
}

if (!useWindowsAuth && (!config.user || !config.password)) {
  console.error('❌ DB_USER и DB_PASSWORD не установлены в .env файле!');
  console.error('   Установите DB_USER и DB_PASSWORD в файле .env');
  console.error('   Или используйте Windows Authentication: DB_TRUSTED_CONNECTION=true');
  process.exit(1);
}

async function checkConnection() {
  console.log('🔍 Проверка подключения к SQL Server...\n');
  console.log('Конфигурация:');
  const serverDisplay = config.options.instanceName 
    ? `${config.server}\\${config.options.instanceName}` 
    : `${config.server}:${config.port || 1433}`;
  console.log(`  Server: ${serverDisplay}`);
  console.log(`  Database: ${config.database}`);
  if (useWindowsAuth) {
    console.log(`  Authentication: Windows Authentication`);
  } else {
    console.log(`  User: ${config.user}`);
    console.log(`  Password: ${'*'.repeat(config.password?.length || 0)}`);
  }
  console.log(`  Trust Server Certificate: ${config.options.trustServerCertificate}`);
  console.log(`  Encrypt: ${config.options.encrypt}\n`);

  try {
    console.log('⏳ Попытка подключения к SQL Server...');
    console.log('   (это может занять несколько секунд)\n');
    
    const pool = await sql.connect(config);
    console.log('✅ Успешное подключение к SQL Server!\n');

    // Проверка базы данных
    const dbCheck = await pool.request().query(`
      SELECT name FROM sys.databases WHERE name = '${config.database}'
    `);

    if (dbCheck.recordset.length === 0) {
      console.log(`⚠️  База данных '${config.database}' не найдена!`);
      console.log(`   Создайте базу данных: CREATE DATABASE ${config.database};`);
    } else {
      console.log(`✅ База данных '${config.database}' найдена\n`);

      // Проверка таблиц
      const tablesCheck = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);

      if (tablesCheck.recordset.length === 0) {
        console.log('⚠️  Таблицы не найдены!');
        console.log('   Выполните schema_mssql.sql для создания таблиц');
      } else {
        console.log(`✅ Найдено таблиц: ${tablesCheck.recordset.length}`);
        console.log('   Таблицы:');
        tablesCheck.recordset.forEach(row => {
          console.log(`     - ${row.TABLE_NAME}`);
        });
      }
    }

    // Тестовый запрос
    const testQuery = await pool.request().query('SELECT GETDATE() as current_time, @@VERSION as version');
    console.log('\n✅ Тестовый запрос выполнен успешно');
    console.log(`   Текущее время сервера: ${testQuery.recordset[0].current_time}`);

    await pool.close();
    console.log('\n✅ Все проверки пройдены! База данных готова к использованию.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Ошибка подключения:');
    console.error(`   Сообщение: ${error.message}`);
    if (error.code) {
      console.error(`   Код ошибки: ${error.code}`);
    }
    if (error.originalError) {
      console.error(`   Оригинальная ошибка: ${error.originalError.message}`);
    }
    console.error('');

    if (error.code === 'ELOGIN') {
      console.error('💡 Возможные решения:');
      console.error('   1. Проверьте правильность DB_USER и DB_PASSWORD');
      console.error('   2. Убедитесь, что SQL Server запущен');
      console.error('   3. Проверьте, что SQL Server Authentication включена');
      console.error('   4. Попробуйте использовать Windows Authentication (DB_TRUSTED_CONNECTION=true)');
    } else if (error.code === 'ETIMEOUT') {
      console.error('💡 Возможные решения:');
      console.error('   1. Проверьте, что SQL Server запущен');
      console.error('   2. Проверьте правильность DB_HOST и DB_PORT');
      console.error('   3. Убедитесь, что TCP/IP протокол включен');
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('Could not connect')) {
      console.error('💡 Возможные решения:');
      console.error('   1. SQL Server не запущен - запустите SQL Server');
      console.error('   2. Проверьте правильность DB_HOST и DB_PORT');
      console.error('   3. Убедитесь, что SQL Server Browser запущен');
      console.error('   4. Проверьте, что TCP/IP протокол включен в SQL Server Configuration Manager');
      console.error('   5. Проверьте firewall - порт 1433 должен быть открыт');
    } else {
      console.error('💡 Общие решения:');
      console.error('   1. Проверьте, что SQL Server запущен');
      console.error('   2. Проверьте правильность всех настроек в .env файле');
      console.error('   3. Попробуйте подключиться через SSMS для проверки');
    }

    console.error('\n📝 Проверьте файл .env в папке backend/');
    console.error('   Убедитесь, что все переменные заполнены правильно');
    process.exit(1);
  }
}

checkConnection();

