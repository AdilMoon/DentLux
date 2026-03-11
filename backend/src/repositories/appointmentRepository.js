const prisma = require('../config/database');

class AppointmentRepository {
  // Получить все записи клиента
  async findByClientId(clientId) {
    return await prisma.appointment.findMany({
      where: { clientId },
      include: {
        client: { select: { id: true, fullName: true, email: true } },
        doctor: { select: { id: true, fullName: true, email: true } },
        service: { select: { id: true, name: true, price: true } },
      },
      orderBy: [
        { appointmentDate: 'desc' },
        { appointmentTime: 'desc' },
      ],
    });
  }

  // Получить все записи доктора
  async findByDoctorId(doctorId) {
    return await prisma.appointment.findMany({
      where: { doctorId },
      include: {
        client: { select: { id: true, fullName: true, email: true } },
        doctor: { select: { id: true, fullName: true, email: true } },
        service: { select: { id: true, name: true, price: true } },
      },
      orderBy: [
        { appointmentDate: 'desc' },
        { appointmentTime: 'desc' },
      ],
    });
  }

  // Получить все записи (для админа)
  async findAll() {
    return await prisma.appointment.findMany({
      include: {
        client: { select: { id: true, fullName: true, email: true } },
        doctor: { select: { id: true, fullName: true, email: true } },
        service: { select: { id: true, name: true, price: true } },
      },
      orderBy: [
        { appointmentDate: 'desc' },
        { appointmentTime: 'desc' },
      ],
    });
  }

  // Создать запись
  async create(data) {
    const { clientId, doctorId, serviceId, appointmentDate, appointmentTime, notes } = data;
    
    // Проверяем, что все ID существуют
    const client = await prisma.user.findUnique({ where: { id: clientId } });
    if (!client) {
      const error = new Error(`Клиент ID ${clientId} табылмады`);
      error.name = 'NotFoundError';
      throw error;
    }

    const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      const error = new Error(`Дәрігер ID ${doctorId} табылмады`);
      error.name = 'NotFoundError';
      throw error;
    }
    if (doctor.role !== 'DOCTOR') {
      const error = new Error(`ID ${doctorId} дәрігер емес`);
      error.name = 'ValidationError';
      throw error;
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      const error = new Error(`Қызмет ID ${serviceId} табылмады`);
      error.name = 'NotFoundError';
      throw error;
    }
    
    // Преобразуем время в формат Time
    const timeDate = new Date(`1970-01-01T${appointmentTime}`);
    const appointmentDateObj = new Date(appointmentDate);
    
    // Проверяем, нет ли уже записи у этого доктора в это же время и дату
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: appointmentDateObj,
        appointmentTime: timeDate,
        status: {
          notIn: ['CANCELLED', 'MISSED'], // Игнорируем отмененные и пропущенные записи
        },
      },
    });

    if (existingAppointment) {
      const error = new Error('Бұл уақытта дәрігерде басқа жазба бар. Басқа уақыт таңдаңыз.');
      error.name = 'ConflictError';
      throw error;
    }
    
    try {
      return await prisma.appointment.create({
        data: {
          clientId,
          doctorId,
          serviceId,
          appointmentDate: appointmentDateObj,
          appointmentTime: timeDate,
          notes,
        },
        include: {
          client: { select: { id: true, fullName: true, email: true } },
          doctor: { select: { id: true, fullName: true, email: true } },
          service: { select: { id: true, name: true, price: true } },
        },
      });
    } catch (error) {
      // Если ошибка Prisma с foreign key constraint
      if (error.code === 'P2003') {
        const errorMsg = new Error('Сілтеме қатесі: клиент, дәрігер немесе қызмет табылмады');
        errorMsg.name = 'ForeignKeyError';
        throw errorMsg;
      }
      throw error;
    }
  }

  // Обновить статус
  async updateStatus(id, status) {
    return await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        client: { select: { id: true, fullName: true, email: true } },
        doctor: { select: { id: true, fullName: true, email: true } },
        service: { select: { id: true, name: true, price: true } },
      },
    });
  }

  // Удалить запись
  async delete(id) {
    return await prisma.appointment.delete({
      where: { id },
    });
  }

  // Найти по ID
  async findById(id) {
    try {
      return await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, fullName: true, email: true } },
        doctor: { select: { id: true, fullName: true, email: true } },
        service: { select: { id: true, name: true, price: true } },
      },
    });
    } catch (error) {
      console.error('Ошибка в appointmentRepository.findById:', error);
      if (error.message && error.message.includes('findUnique')) {
        console.error('Prisma client состояние:', {
          prismaExists: !!prisma,
          appointmentModelExists: !!prisma?.appointment,
        });
      }
      throw error;
    }
  }

  // Найти по ID с полной информацией (для платежей)
  async findByIdWithService(id) {
    return await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { 
          select: { 
            id: true,
            fullName: true,
            email: true,
            phone: true,
          } 
        },
        doctor: { select: { id: true, fullName: true } },
        service: true, // Полная информация о сервисе включая price
      },
    });
  }

  // Найти записи доктора по дате
  async findByDoctorIdAndDate(doctorId, date) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    return await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: dateObj,
          lt: nextDay,
        },
      },
      select: {
        id: true,
        appointmentTime: true,
        status: true,
      },
    });
  }
}

module.exports = new AppointmentRepository();
