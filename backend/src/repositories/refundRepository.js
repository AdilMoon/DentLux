const prisma = require('../config/database');

class RefundRepository {
  // Создать возврат
  async create(data) {
    return await prisma.refund.create({
      data,
      include: {
        payment: {
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
        },
        client: { select: { fullName: true } },
      },
    });
  }

  // Найти по ID
  async findById(id) {
    return await prisma.refund.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            appointment: {
              include: {
                service: true,
              },
            },
          },
        },
        client: { select: { fullName: true } },
      },
    });
  }

  // Получить возвраты клиента
  async findByClientId(clientId) {
    return await prisma.refund.findMany({
      where: { clientId },
      include: {
        payment: {
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
        },
        client: { select: { fullName: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Получить все возвраты
  async findAll() {
    return await prisma.refund.findMany({
      include: {
        payment: {
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
        },
        client: { select: { fullName: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Обновить возврат
  async update(id, data) {
    return await prisma.refund.update({
      where: { id },
      data,
      include: {
        payment: {
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
        },
        client: { select: { fullName: true } },
      },
    });
  }
}

module.exports = new RefundRepository();
