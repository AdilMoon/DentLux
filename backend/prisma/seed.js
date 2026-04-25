const { PrismaClient, Prisma } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Dentlux2026!';

function toDecimal(value) {
  return new Prisma.Decimal(value);
}

async function tableExists(tableName) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${tableName}
    ) AS "exists"
  `;
  return Boolean(rows?.[0]?.exists);
}

async function createUser({ email, fullName, phone, role, password = DEFAULT_PASSWORD, avatarUrl = null }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      fullName,
      phone,
      role,
      avatarUrl,
      passwordHash,
    },
  });
}

async function main() {
  console.log('🌱 Детальное заполнение DentLux (RU + KZ)...\n');

  const tableMap = {
    users: await tableExists('users'),
    doctors: await tableExists('doctors'),
    services: await tableExists('services'),
    appointments: await tableExists('appointments'),
    payments: await tableExists('payments'),
    expenses: await tableExists('expenses'),
    refunds: await tableExists('refunds'),
    contactMessages: await tableExists('contact_messages'),
    medicalRecords: await tableExists('medical_records'),
    reviews: await tableExists('reviews'),
    auditLogs: await tableExists('audit_logs'),
    passwordResetTokens: await tableExists('password_reset_tokens'),
    clientBlocks: await tableExists('client_blocks'),
  };

  console.log('🧹 Очистка существующих данных...');
  if (tableMap.clientBlocks) await prisma.clientBlock.deleteMany();
  if (tableMap.passwordResetTokens) await prisma.passwordResetToken.deleteMany();
  if (tableMap.auditLogs) await prisma.auditLog.deleteMany();
  if (tableMap.reviews) await prisma.review.deleteMany();
  if (tableMap.medicalRecords) await prisma.medicalRecord.deleteMany();
  if (tableMap.contactMessages) await prisma.contactMessage.deleteMany();
  if (tableMap.refunds) await prisma.refund.deleteMany();
  if (tableMap.expenses) await prisma.expense.deleteMany();
  if (tableMap.payments) await prisma.payment.deleteMany();
  if (tableMap.appointments) await prisma.appointment.deleteMany();
  if (tableMap.services) await prisma.service.deleteMany();
  if (tableMap.doctors) await prisma.doctor.deleteMany();
  if (tableMap.users) await prisma.user.deleteMany();

  console.log('👤 Создание администраторов...');
  const adminRu = await createUser({
    email: 'admin.ru@dentlux.kz',
    fullName: 'Иван Петров',
    phone: '+77010000001',
    role: 'ADMIN',
  });
  const adminKk = await createUser({
    email: 'admin.kk@dentlux.kz',
    fullName: 'Айгерим Нуртаева',
    phone: '+77010000002',
    role: 'ADMIN',
  });

  console.log('🦷 Создание услуг (рус/қаз)...');
  const servicesData = [
    ['Консультация / Кеңес беру', 30, 6000],
    ['Профессиональная чистка / Кәсіби тазалау', 45, 12000],
    ['Лечение кариеса / Кариес емдеу', 60, 18000],
    ['Лечение пульпита / Пульпит емдеу', 90, 30000],
    ['Удаление зуба / Тіс жұлу', 40, 14000],
    ['Имплантация / Имплантация', 120, 180000],
    ['Протезирование / Протездеу', 90, 95000],
    ['Ортодонтия (брекеты) / Брекет орнату', 75, 80000],
    ['Детская стоматология / Балалар стоматологиясы', 30, 9000],
    ['Отбеливание / Тісті ағарту', 60, 45000],
  ];

  const services = [];
  for (const [name, durationMinutes, price] of servicesData) {
    const service = await prisma.service.create({
      data: {
        name,
        description: `Услуга DentLux: ${name}`,
        durationMinutes,
        price: toDecimal(price),
        isActive: true,
      },
    });
    services.push(service);
  }

  console.log('👨‍⚕️ Создание врачей...');
  const doctorProfiles = [
    { name: 'Асылбек Нурланов', email: 'asylbek@dentlux.kz', phone: '+77020000001', spec: 'Терапевт', exp: 7 },
    { name: 'Динара Касымова', email: 'dinara@dentlux.kz', phone: '+77020000002', spec: 'Хирург', exp: 11 },
    { name: 'Ерлан Турсынов', email: 'erlan@dentlux.kz', phone: '+77020000003', spec: 'Ортодонт', exp: 9 },
    { name: 'Айгуль Абильдаева', email: 'aigul@dentlux.kz', phone: '+77020000004', spec: 'Ортопед', exp: 13 },
    { name: 'Нурлан Бейсенов', email: 'nurlan@dentlux.kz', phone: '+77020000005', spec: 'Балалар стоматологы', exp: 8 },
    { name: 'Гульнур Сабитова', email: 'gulnur@dentlux.kz', phone: '+77020000006', spec: 'Эндодонт', exp: 10 },
  ];

  const doctors = [];
  for (const profile of doctorProfiles) {
    const user = await createUser({
      email: profile.email,
      fullName: profile.name,
      phone: profile.phone,
      role: 'DOCTOR',
    });
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: profile.spec,
        experienceYears: profile.exp,
        workSchedule: JSON.stringify({
          mon: '09:00-18:00',
          tue: '09:00-18:00',
          wed: '09:00-18:00',
          thu: '09:00-18:00',
          fri: '09:00-18:00',
          sat: '10:00-15:00',
        }),
      },
    });
    doctors.push({ user, doctor });
  }

  console.log('🧑‍🤝‍🧑 Создание клиентов (рус/қаз)...');
  const clientsData = [
    { name: 'Алексей Соколов', email: 'aleksey.sokolov@mail.ru', phone: '+77030000001' },
    { name: 'Мария Иванова', email: 'maria.ivanova@mail.ru', phone: '+77030000002' },
    { name: 'Екатерина Смирнова', email: 'katya.smirnova@mail.ru', phone: '+77030000003' },
    { name: 'Павел Орлов', email: 'pavel.orlov@mail.ru', phone: '+77030000004' },
    { name: 'Жанар Алимжанова', email: 'zhanar.alimzhanova@mail.kz', phone: '+77030000005' },
    { name: 'Еркебулан Серик', email: 'erkebulan.serik@mail.kz', phone: '+77030000006' },
    { name: 'Аружан Куаныш', email: 'aruzhan.kuanysh@mail.kz', phone: '+77030000007' },
    { name: 'Данияр Толеуов', email: 'daniyar.toleuov@mail.kz', phone: '+77030000008' },
    { name: 'Светлана Руднева', email: 'sveta.rudneva@mail.ru', phone: '+77030000009' },
    { name: 'Тимур Абдыкадыров', email: 'timur.abdykadyrov@mail.kz', phone: '+77030000010' },
    { name: 'Ольга Романенко', email: 'olga.romanenko@mail.ru', phone: '+77030000011' },
    { name: 'Камила Жумабаева', email: 'kamila.zhumabayeva@mail.kz', phone: '+77030000012' },
  ];

  const clients = [];
  for (const c of clientsData) {
    clients.push(await createUser({ email: c.email, fullName: c.name, phone: c.phone, role: 'CLIENT' }));
  }

  console.log('📅 Создание записей, оплат, медкарт, отзывов...');
  const statuses = ['PENDING', 'ARRIVED', 'VISITED', 'COMPLETED', 'CANCELLED'];
  const payments = [];

  for (let i = 0; i < 28; i += 1) {
    const client = clients[i % clients.length];
    const doctorUser = doctors[i % doctors.length].user;
    const service = services[i % services.length];
    const day = (i % 25) + 1;
    const appointmentDate = new Date(`2026-04-${String(day).padStart(2, '0')}T00:00:00.000Z`);
    const appointmentTime = new Date(`1970-01-01T${String(9 + (i % 8)).padStart(2, '0')}:${i % 2 ? '30' : '00'}:00.000Z`);
    const status = statuses[i % statuses.length];

    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        doctorId: doctorUser.id,
        serviceId: service.id,
        appointmentDate,
        appointmentTime,
        status,
        notes: i % 2 ? 'Повторный визит / Қайта тексеру' : 'Первичная консультация / Алғашқы қабылдау',
      },
    });

    const payment = tableMap.payments ? await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        amount: service.price,
        status: status === 'CANCELLED' ? 'REFUNDED' : i % 3 === 0 ? 'PENDING' : 'PAID',
        paymentMethod: i % 2 === 0 ? 'CARD' : 'CASH',
        gatewayType: i % 2 === 0 ? 'KaspiPay' : 'POS',
        gatewayTransactionId: `DLX-${20260000 + i}`,
      },
    }) : null;
    if (payment) payments.push(payment);

    if ((status === 'VISITED' || status === 'COMPLETED') && tableMap.medicalRecords) {
      await prisma.medicalRecord.create({
        data: {
          appointmentId: appointment.id,
          clientId: client.id,
          doctorId: doctorUser.id,
          diagnosis: 'Кариес средней глубины / Орташа терең кариес',
          treatment: 'Пломбирование композитом / Композитпен пломбалау',
          notes: 'Рекомендован осмотр через 6 месяцев / 6 айдан кейін тексеріс',
          prescriptions: 'Паста с фтором, ирригатор / Фторлы паста, ирригатор',
        },
      });

      if (tableMap.reviews) {
        await prisma.review.create({
          data: {
            appointmentId: appointment.id,
            clientId: client.id,
            doctorId: doctorUser.id,
            serviceId: service.id,
            rating: 4 + (i % 2),
            comment: i % 2
              ? 'Очень внимательный врач, объяснили весь план лечения.'
              : 'Дәрігер өте мұқият, қабылдау сапалы өтті.',
            isApproved: true,
          },
        });
      }
    }

    if (status === 'CANCELLED' && tableMap.refunds && payment) {
      await prisma.refund.create({
        data: {
          paymentId: payment.id,
          clientId: client.id,
          amount: service.price,
          reason: 'Отмена по семейным обстоятельствам / Отбасылық себеп',
          status: i % 2 === 0 ? 'APPROVED' : 'PENDING',
          processedBy: i % 2 === 0 ? adminRu.id : null,
          processedAt: i % 2 === 0 ? new Date() : null,
        },
      });
    }
  }

  console.log('💸 Создание расходов...');
  const expensesData = [
    ['RENT', 450000, 'Аренда помещения / Ғимарат жалдау'],
    ['SALARY', 1200000, 'ФОТ персонала / Қызметкерлер жалақысы'],
    ['SUPPLIES', 280000, 'Расходные материалы / Шығыс материалдары'],
    ['EQUIPMENT', 760000, 'Стоматологическое оборудование / Жабдықтар'],
    ['UTILITIES', 120000, 'Коммунальные услуги / Коммуналдық төлемдер'],
    ['OTHER', 90000, 'Маркетинг и реклама / Маркетинг және жарнама'],
  ];
  if (tableMap.expenses) {
    for (const [category, amount, description] of expensesData) {
      await prisma.expense.create({
        data: {
          category,
          amount: toDecimal(amount),
          description,
          expenseDate: new Date('2026-04-15T00:00:00.000Z'),
          createdBy: adminKk.id,
        },
      });
    }
  }

  console.log('📩 Создание обращений с сайта...');
  const messages = [
    ['Николай', 'nikolay@example.com', '+77045550101', 'Здравствуйте, есть ли свободное время на завтра после 18:00?'],
    ['Мадина', 'madina@example.kz', '+77045550102', 'Сәлеметсіз бе, балалар стоматологына сенбіге жазылуға бола ма?'],
    ['Алия', 'aliya@example.kz', '+77045550103', 'Имплантация бойынша консультация бағасын нақтылағым келеді.'],
    ['Roman', 'roman@example.ru', '+77045550104', 'Нужна срочная запись, острая зубная боль.'],
  ];
  if (tableMap.contactMessages) {
    for (const [name, email, phone, message] of messages) {
      await prisma.contactMessage.create({
        data: {
          name,
          email,
          phone,
          message,
          isRead: false,
        },
      });
    }
  }

  if (tableMap.auditLogs) {
    console.log('📋 Демо-записи audit log...');
    await prisma.auditLog.createMany({
      data: [
        {
          userId: adminRu.id,
          action: 'LOGIN',
          entityType: 'User',
          entityId: adminRu.id,
          changes: '{"source":"seed"}',
          ipAddress: '127.0.0.1',
          userAgent: 'DentLux seed script',
        },
        {
          userId: adminKk.id,
          action: 'CREATE',
          entityType: 'Service',
          entityId: services[0]?.id,
          changes: '{"message":"seed demo"}',
          ipAddress: '127.0.0.1',
          userAgent: 'DentLux seed script',
        },
      ],
    });
  }

  console.log('\n✅ Заполнение завершено успешно.');
  console.log(`👤 Админы: ${adminRu.email}, ${adminKk.email}`);
  console.log(`🔐 Единый пароль для seed-пользователей: ${DEFAULT_PASSWORD}`);
  console.log(`🧑 Клиенты: ${clients.length}, 👨‍⚕️ Врачи: ${doctors.length}, 🦷 Услуги: ${services.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



