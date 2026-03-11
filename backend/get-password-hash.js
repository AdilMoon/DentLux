// Простой скрипт для получения хэша пароля
// Использование: node get-password-hash.js <ваш_пароль>

const bcrypt = require('bcrypt');
const password = process.argv[2];

if (!password) {
  console.error('Использование: node get-password-hash.js <пароль>');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('\nХэш пароля:');
  console.log(hash);
  console.log('\nИспользуйте этот хэш в SQL скрипте create-admin-direct.sql');
}).catch(err => {
  console.error('Ошибка:', err.message);
  process.exit(1);
});
