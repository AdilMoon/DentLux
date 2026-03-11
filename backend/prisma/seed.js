const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало заполнения базы данных...\n');

  // Очистка существующих данных (в порядке зависимости)
  console.log('🧹 Очистка существующих данных...');
  await prisma.refund.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();

  // Создание администратора
  console.log('👤 Создание администратора...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dentreserve.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      fullName: 'Әкімші',
      phone: '+77001234567',
    },
  });
  console.log(`✅ Создан администратор: ${admin.email}`);

  // Создание услуг (на казахском языке)
  console.log('\n🦷 Создание услуг...');
  const servicesData = [
    {
      name: 'Кеңес',
      description: 'Стоматологтың алғашқы кеңесі',
      durationMinutes: 30,
      price: 5000,
      isActive: true,
    },
    {
      name: 'Кариес емдеу',
      description: 'Кариесті пломбалаумен емдеу',
      durationMinutes: 60,
      price: 15000,
      isActive: true,
    },
    {
      name: 'Кәсіби тазалау',
      description: 'Тістерді кәсіби тазалау',
      durationMinutes: 45,
      price: 8000,
      isActive: true,
    },
    {
      name: 'Тіс алу',
      description: 'Тіс алу',
      durationMinutes: 30,
      price: 12000,
      isActive: true,
    },
    {
      name: 'Тіс имплантациясы',
      description: 'Тіс имплантатын орнату',
      durationMinutes: 120,
      price: 150000,
      isActive: true,
    },
    {
      name: 'Тіс протездеу',
      description: 'Тіс протезін орнату',
      durationMinutes: 90,
      price: 80000,
      isActive: true,
    },
    {
      name: 'Ортодонтиялық емдеу',
      description: 'Тіс қатарларын түзету',
      durationMinutes: 60,
      price: 45000,
      isActive: true,
    },
    {
      name: 'Пародонтоз емдеу',
      description: 'Қанайналым ауруларын емдеу',
      durationMinutes: 45,
      price: 25000,
      isActive: true,
    },
    {
      name: 'Балаларға кеңес',
      description: 'Балалар стоматологының кеңесі',
      durationMinutes: 30,
      price: 6000,
      isActive: true,
    },
    {
      name: 'Тіс ағындарын емдеу',
      description: 'Тіс тамырларын емдеу',
      durationMinutes: 90,
      price: 35000,
      isActive: true,
    },
    {
      name: 'Тістерді ағарту',
      description: 'Тістерді ағарту процедурасы',
      durationMinutes: 60,
      price: 30000,
      isActive: true,
    },
    {
      name: 'Рентген снимогі',
      description: 'Тіс рентген снимогі',
      durationMinutes: 15,
      price: 5000,
      isActive: true,
    },
  ];

  for (const serviceData of servicesData) {
    const service = await prisma.service.create({
      data: serviceData,
    });
    console.log(`✅ Создана услуга: ${service.name} - ${service.price} тг`);
  }

  // Создание докторов
  console.log('\n👨‍⚕️ Создание докторов...');
  const specializations = [
    'Терапевт',
    'Хирург',
    'Ортодонт',
    'Ортопед',
    'Пародонтолог',
    'Эндодонт',
    'Балалар стоматологы',
    'Имплантолог',
    'Протезист',
    'Гигиенист',
  ];

  const doctorsData = [
    { name: 'Асылбек Нұрланов', email: 'asylbek.nurlanov@dentreserve.com', password: 'Asylbek2024!', phone: '+77001234501', spec: 'Терапевт' },
    { name: 'Динара Қасымова', email: 'dinara.kasymova@dentreserve.com', password: 'Dinara99@clinic', phone: '+77001234502', spec: 'Хирург' },
    { name: 'Ерлан Тұрсынов', email: 'erlan.tursynov@dentreserve.com', password: 'Erlan2024#dent', phone: '+77001234503', spec: 'Ортодонт' },
    { name: 'Айгүл Әбілдаева', email: 'aigul.abildayeva@dentreserve.com', password: 'Aigul2024$doctor', phone: '+77001234504', spec: 'Ортопед' },
    { name: 'Марат Жұмабеков', email: 'marat.zhumabekov@dentreserve.com', password: 'Marat2024%med', phone: '+77001234505', spec: 'Пародонтолог' },
    { name: 'Гүлнұр Сәбитова', email: 'gulnur.sabitova@dentreserve.com', password: 'Gulnur2024^treatment', phone: '+77001234506', spec: 'Эндодонт' },
    { name: 'Нұрлан Бейсенов', email: 'nurlan.beisenov@dentreserve.com', password: 'Nurlan2024&doctor', phone: '+77001234507', spec: 'Балалар стоматологы' },
    { name: 'Алтынай Қадырова', email: 'altynai.kadyrova@dentreserve.com', password: 'Altynai2024*doc', phone: '+77001234508', spec: 'Имплантолог' },
    { name: 'Бауыржан Омаров', email: 'bauyrzhan.omarov@dentreserve.com', password: 'Bauyrzhan2024(dent)', phone: '+77001234509', spec: 'Протезист' },
    { name: 'Ақмарал Нұрғалиева', email: 'akmaral.nurgaliyeva@dentreserve.com', password: 'Akmaral2024)clinic', phone: '+77001234510', spec: 'Гигиенист' },
    { name: 'Талғат Айтбаев', email: 'talgat.aytbaev@dentreserve.com', password: 'Talgat2024-doctor', phone: '+77001234511', spec: 'Терапевт' },
    { name: 'Жанар Есқалиева', email: 'zhanar.eskaliyeva@dentreserve.com', password: 'Zhanar2024_dentist', phone: '+77001234512', spec: 'Хирург' },
    { name: 'Дастан Құдайбергенов', email: 'dastan.kudaybergenov@dentreserve.com', password: 'Dastan2024+doctor', phone: '+77001234513', spec: 'Ортодонт' },
    { name: 'Сауле Мұхамеджанова', email: 'saule.mukhamedzhanova@dentreserve.com', password: 'Saule2024=treatment', phone: '+77001234514', spec: 'Ортопед' },
    { name: 'Асхат Рахманов', email: 'askhat.rakhmanov@dentreserve.com', password: 'Askhat2024|doctor', phone: '+77001234515', spec: 'Пародонтолог' },
    { name: 'Гүлшат Жақсылықова', email: 'gulshat.zhaksylykova@dentreserve.com', password: 'Gulshat2024~dent', phone: '+77001234516', spec: 'Эндодонт' },
    { name: 'Қанат Әлімов', email: 'kanat.alimov@dentreserve.com', password: 'Kanat2024`doctor', phone: '+77001234517', spec: 'Балалар стоматологы' },
    { name: 'Аружан Төлеубаева', email: 'aruzhan.toleubayeva@dentreserve.com', password: 'Aruzhan2024{doctor}', phone: '+77001234518', spec: 'Имплантолог' },
    { name: 'Рустем Кенжебаев', email: 'rustem.kenzhebaev@dentreserve.com', password: 'Rustem2024}dent', phone: '+77001234519', spec: 'Протезист' },
    { name: 'Мәдина Серікбаева', email: 'madina.serikbayeva@dentreserve.com', password: 'Madina2024:doctor', phone: '+77001234520', spec: 'Гигиенист' },
  ];

  const createdDoctors = [];
  for (const docData of doctorsData) {
    const passwordHash = await bcrypt.hash(docData.password, 10);
    const user = await prisma.user.create({
      data: {
        email: docData.email,
        passwordHash: passwordHash,
        role: 'DOCTOR',
        fullName: docData.name,
        phone: docData.phone,
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: docData.spec,
        experienceYears: Math.floor(Math.random() * 20) + 1, // Случайный опыт от 1 до 20 лет
      },
    });

    createdDoctors.push({ name: docData.name, email: docData.email, password: docData.password });
    console.log(`✅ Создан доктор: ${docData.name} (${docData.spec}) - ${docData.email}`);
  }

  console.log('\n✅ База данных успешно заполнена!');
  console.log('\n📋 Кіру деректері:');
  console.log('   Әкімші:');
  console.log('   - Email: admin@dentreserve.com');
  console.log('   - Пароль: admin123');
  console.log('\n👨‍⚕️ Дәрігерлер (20 дана):');
  createdDoctors.forEach((doc, index) => {
    console.log(`   ${index + 1}. ${doc.name}`);
    console.log(`      Email: ${doc.email}`);
    console.log(`      Пароль: ${doc.password}`);
  });
  console.log('\n💡 Енді сіз:');
  console.log('   • Әкімші немесе кез келген дәрігер ретінде кіре аласыз');
  console.log('   • Интерфейс арқылы клиенттерді тіркеуге болады');
  console.log('   • Жазылулар, төлемдер жасап және жүйемен жұмыс істей аласыз');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



