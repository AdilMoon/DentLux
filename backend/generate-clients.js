const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Казахские имена и фамилии
const kazakhFirstNames = [
  'Айбек', 'Асылбек', 'Нұрлан', 'Ерлан', 'Бауыржан', 'Дастан', 'Асқар', 'Талғат', 'Қанат', 'Арман',
  'Нұрбол', 'Серик', 'Асхат', 'Рустем', 'Азамат', 'Ержан', 'Алтынбек', 'Жандос', 'Айдын', 'Бекзат',
  'Айгүл', 'Алтынай', 'Динара', 'Гүлнұр', 'Жанар', 'Сауле', 'Аружан', 'Мәдина', 'Ақмарал', 'Гүлшат',
  'Айжан', 'Қарлығаш', 'Жұлдыз', 'Назгүл', 'Айсұлу', 'Меруерт', 'Ділназ', 'Айсулу', 'Асыл', 'Жансая',
  'Алма', 'Айнур', 'Гүлжай', 'Айгуль', 'Дина', 'Асел', 'Сания', 'Амина', 'Айгерім', 'Айнура',
  'Жансая', 'Мәриям', 'Айжан', 'Жанат', 'Асель', 'Айдана', 'Айсулу', 'Гүлназ', 'Айдана', 'Айжамал'
];

const kazakhLastNames = [
  'Ахметов', 'Нұрланов', 'Қасымов', 'Тұрсынов', 'Жұмабеков', 'Бейсенов', 'Омаров', 'Сәбитов', 'Есқалиев', 'Құдайбергенов',
  'Мұхамеджанов', 'Рахманов', 'Жақсылықов', 'Әлімов', 'Төлеубаев', 'Кенжебаев', 'Серікбаев', 'Әбілдаев', 'Қадыров', 'Нұрғалиев',
  'Айтбаев', 'Мұратбеков', 'Сапаров', 'Қасымов', 'Тәжібаев', 'Жұмағалиев', 'Абдуллаев', 'Мамытов', 'Қалиев', 'Смағұлов',
  'Әлібеков', 'Тайжібеков', 'Бекжанов', 'Ақтаев', 'Төлегенов', 'Қазыбеков', 'Сыдықов', 'Жумабеков', 'Асылбеков', 'Нұртазин',
  'Талғатов', 'Даулетов', 'Ермеков', 'Қайратов', 'Серікбайұлы', 'Аманғазиев', 'Төлеуов', 'Жұмағұлов', 'Әліев', 'Нұржанов'
];

// Генерация случайного пароля на английском
function generatePassword() {
  const length = 8;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Генерация телефона
function generatePhone(index) {
  const base = 77001000000;
  return `+7${base + index}`;
}

// Транслитерация казахских букв в латиницу
function transliterateKazakh(text) {
  const map = {
    'а': 'a', 'ә': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'ғ': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'қ': 'q', 'л': 'l', 'м': 'm', 'н': 'n',
    'ң': 'ng', 'о': 'o', 'ө': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ұ': 'u',
    'ү': 'u', 'ф': 'f', 'х': 'h', 'һ': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'і': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Ә': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Ғ': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Қ': 'Q', 'Л': 'L', 'М': 'M', 'Н': 'N',
    'Ң': 'Ng', 'О': 'O', 'Ө': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ұ': 'U',
    'Ү': 'U', 'Ф': 'F', 'Х': 'H', 'Һ': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ъ': '', 'Ы': 'Y', 'І': 'I', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };
  
  return text.split('').map(char => map[char] || char).join('').toLowerCase();
}

// Генерация email в формате: имя.фамилия + номер @dentlux.kz
function generateEmail(firstName, lastName, index) {
  const firstNameTranslit = transliterateKazakh(firstName);
  const lastNameTranslit = transliterateKazakh(lastName);
  return `${firstNameTranslit}.${lastNameTranslit}${index}@dentlux.kz`;
}

async function main() {
  console.log('🌱 150 клиент құру басталды...\n');

  const createdUsers = [];

  for (let i = 0; i < 150; i++) {
    const firstName = kazakhFirstNames[Math.floor(Math.random() * kazakhFirstNames.length)];
    const lastName = kazakhLastNames[Math.floor(Math.random() * kazakhLastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const email = generateEmail(firstName, lastName, i + 1);
    const password = generatePassword();
    const phone = generatePhone(i + 1);

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email: email,
          passwordHash: passwordHash,
          role: 'CLIENT',
          fullName: fullName,
          phone: phone,
        },
      });

      createdUsers.push({
        name: fullName,
        email: email,
        password: password,
        phone: phone,
      });

      console.log(`${i + 1}/150 ✅ ${fullName} - ${email}`);
    } catch (error) {
      console.error(`❌ Ошибка при создании пользователя ${fullName}:`, error.message);
    }
  }

  console.log('\n✅ Барлығы 150 клиент құрылды!\n');
  console.log('📋 Кіру деректері (бірінші 10):\n');
  createdUsers.slice(0, 10).forEach((user, index) => {
    console.log(`${index + 1}. ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Пароль: ${user.password}`);
    console.log(`   Телефон: ${user.phone}\n`);
  });

  // Сохраняем все данные в файл
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, 'generated-clients.json');
  fs.writeFileSync(filePath, JSON.stringify(createdUsers, null, 2), 'utf8');
  console.log(`\n💾 Барлық деректер сақталды: ${filePath}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при создании клиентов:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
