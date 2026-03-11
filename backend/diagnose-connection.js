// Скрипт для диагностики подключения к SQL Server
require('dotenv').config();
const dns = require('dns').promises;
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

async function diagnose() {
  console.log('🔍 Диагностика подключения к SQL Server ARSEN\n');

  const host = process.env.DB_HOST || 'ARSEN';
  const port = process.env.DB_PORT || 1433;

  console.log('1️⃣ Проверка разрешения DNS/имени хоста...');
  try {
    const addresses = await dns.lookup(host);
    console.log(`   ✅ Хост ${host} разрешается в: ${addresses.address}`);
    if (addresses.family === 4) {
      console.log(`   📍 IPv4 адрес: ${addresses.address}`);
    }
  } catch (error) {
    console.log(`   ❌ Не удалось разрешить имя ${host}`);
    console.log(`   💡 Попробуйте использовать IP адрес или проверьте имя сервера\n`);
  }

  console.log('\n2️⃣ Проверка доступности порта...');
  try {
    // Попробуем использовать netstat или другой способ проверки порта
    if (process.platform === 'win32') {
      try {
        const { stdout } = await execAsync(`netstat -an | findstr :${port}`);
        if (stdout) {
          console.log(`   ✅ Порт ${port} используется (возможно SQL Server слушает):`);
          console.log(`   ${stdout.split('\n').filter(l => l.trim()).join('\n   ')}`);
        } else {
          console.log(`   ⚠️  Порт ${port} не найден в активных соединениях`);
        }
      } catch (error) {
        console.log(`   ⚠️  Не удалось проверить порт через netstat`);
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Ошибка при проверке порта: ${error.message}`);
  }

  console.log('\n3️⃣ Проверка служб SQL Server...');
  if (process.platform === 'win32') {
    try {
      const { stdout } = await execAsync('sc query MSSQLSERVER');
      if (stdout.includes('RUNNING')) {
        console.log('   ✅ SQL Server (MSSQLSERVER) запущен');
      } else if (stdout.includes('STOPPED')) {
        console.log('   ❌ SQL Server (MSSQLSERVER) остановлен');
        console.log('   💡 Запустите SQL Server через Services или SQL Server Configuration Manager');
      } else {
        console.log('   ⚠️  Не удалось определить статус SQL Server');
        console.log('   💡 Проверьте, что SQL Server установлен и запущен');
      }
    } catch (error) {
      console.log('   ⚠️  Не удалось проверить статус SQL Server');
      console.log(`   💡 Попробуйте проверить вручную через Services (services.msc)`);
    }
  }

  console.log('\n4️⃣ Альтернативные варианты подключения:');
  console.log(`   Вариант 1: Используйте localhost (если ARSEN - это ваш локальный компьютер)`);
  console.log(`             DB_HOST=localhost`);
  console.log(`   Вариант 2: Используйте имя с экземпляром (если используется именованный экземпляр)`);
  console.log(`             DB_HOST=ARSEN\\SQLEXPRESS`);
  console.log(`             или DB_HOST=ARSEN\\MSSQLSERVER`);
  console.log(`   Вариант 3: Используйте IP адрес сервера`);
  console.log(`             DB_HOST=192.168.x.x`);

  console.log('\n5️⃣ Рекомендации:');
  console.log('   • Убедитесь, что SQL Server запущен');
  console.log('   • Проверьте SQL Server Configuration Manager:');
  console.log('     - SQL Server Network Configuration -> Protocols for MSSQLSERVER');
  console.log('     - Убедитесь, что TCP/IP включен и Enabled = Yes');
  console.log('   • Проверьте, что SQL Server Browser запущен (если используется именованный экземпляр)');
  console.log('   • Проверьте Windows Firewall - порт 1433 должен быть открыт');
  console.log('   • Попробуйте подключиться через SSMS с теми же параметрами');

  console.log('\n📝 Текущие настройки из .env:');
  console.log(`   DB_HOST=${process.env.DB_HOST || 'не установлен'}`);
  console.log(`   DB_PORT=${process.env.DB_PORT || 'не установлен'}`);
  console.log(`   DB_NAME=${process.env.DB_NAME || 'не установлен'}`);
  console.log(`   DB_TRUSTED_CONNECTION=${process.env.DB_TRUSTED_CONNECTION || 'не установлен'}`);
}

diagnose().catch(console.error);
