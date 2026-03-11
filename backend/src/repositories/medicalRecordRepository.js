const prisma = require('../config/database');
const AppError = require('../utils/errors');

class MedicalRecordRepository {
  // Создать или обновить медицинскую запись
  async createOrUpdate(appointmentId, data) {
    // Проверяем, существует ли запись
    const existing = await prisma.medicalRecord.findUnique({
      where: { appointmentId },
    });

    if (existing) {
      // Обновляем существующую запись
      return await prisma.medicalRecord.update({
        where: { appointmentId },
        data: {
          diagnosis: data.diagnosis || null,
          treatment: data.treatment || null,
          notes: data.notes || null,
          prescriptions: data.prescriptions || null,
        },
        include: {
          appointment: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });
    } else {
      // Создаем новую запись
      // Сначала получаем информацию о записи
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: {
          clientId: true,
          doctorId: true,
        },
      });

      if (!appointment) {
        throw new AppError('Жазылу табылмады', 404);
      }

      return await prisma.medicalRecord.create({
        data: {
          appointmentId,
          clientId: appointment.clientId,
          doctorId: appointment.doctorId,
          diagnosis: data.diagnosis || null,
          treatment: data.treatment || null,
          notes: data.notes || null,
          prescriptions: data.prescriptions || null,
        },
        include: {
          appointment: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });
    }
  }

  // Получить все медицинские записи клиента
  async findByClientId(clientId) {
    return await prisma.medicalRecord.findMany({
      where: { clientId },
      include: {
        appointment: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Получить все медицинские записи доктора
  async findByDoctorId(doctorId) {
    return await prisma.medicalRecord.findMany({
      where: { doctorId },
      include: {
        appointment: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Получить медицинскую запись по appointmentId
  async findByAppointmentId(appointmentId) {
    return await prisma.medicalRecord.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  // Получить историю пациента для доктора (все записи конкретного клиента)
  async getPatientHistory(doctorId, clientId) {
    return await prisma.medicalRecord.findMany({
      where: {
        doctorId,
        clientId,
      },
      include: {
        appointment: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

module.exports = new MedicalRecordRepository();
