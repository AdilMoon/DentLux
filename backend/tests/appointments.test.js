const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');
const jwt = require('jsonwebtoken');

describe('Appointments API', () => {
  let clientToken;
  let clientId;
  let doctorId;
  let serviceId;

  beforeAll(async () => {
    // Создаем тестового клиента
    const client = await prisma.user.create({
      data: {
        email: 'appointmentclient@test.com',
        passwordHash: '$2b$10$rKxYqZqYqZqYqZqYqZqYqOqZqYqZqYqZqYqZqYqZqYqZqYqZqYq',
        fullName: 'Тестовый Клиент',
        role: 'CLIENT',
      },
    });
    clientId = client.id;
    clientToken = jwt.sign({ id: client.id, role: 'CLIENT' }, process.env.JWT_SECRET || 'test-secret');

    // Создаем тестового доктора
    const doctor = await prisma.user.create({
      data: {
        email: 'appointmentdoctor@test.com',
        passwordHash: '$2b$10$rKxYqZqYqZqYqZqYqZqYqOqZqYqZqYqZqYqZqYqZqYqZqYqZqYq',
        fullName: 'Тестовый Доктор',
        role: 'DOCTOR',
        doctor: {
          create: {
            specialization: 'Стоматолог',
          },
        },
      },
      include: {
        doctor: true,
      },
    });
    doctorId = doctor.id;

    // Создаем тестовую услугу
    const service = await prisma.service.create({
      data: {
        name: 'Тестовая Услуга',
        description: 'Описание тестовой услуги',
        durationMinutes: 30,
        price: 5000,
      },
    });
    serviceId = service.id;
  });

  afterAll(async () => {
    // Очистка тестовых данных
    await prisma.appointment.deleteMany({
      where: {
        clientId: clientId,
      },
    });
    await prisma.service.delete({ where: { id: serviceId } });
    await prisma.doctor.delete({ where: { userId: doctorId } });
    await prisma.user.deleteMany({
      where: {
        id: { in: [clientId, doctorId] },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/appointments', () => {
    it('должен создать новую запись', async () => {
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 1); // Завтра

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          doctorId: doctorId,
          serviceId: serviceId,
          appointmentDate: appointmentDate.toISOString().split('T')[0],
          appointmentTime: '10:00',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.doctorId).toBe(doctorId);
      expect(response.body.data.serviceId).toBe(serviceId);
    });

    it('должен вернуть ошибку без авторизации', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({
          doctorId: doctorId,
          serviceId: serviceId,
          appointmentDate: '2024-12-31',
          appointmentTime: '10:00',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/appointments/my', () => {
    it('должен вернуть записи клиента', async () => {
      const response = await request(app)
        .get('/api/appointments/my')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
