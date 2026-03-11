const prisma = require('../config/database');

class ClientBlockRepository {
  // Создать блокировку
  async create(blockData) {
    return await prisma.clientBlock.create({
      data: blockData,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        blockedByUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  // Найти блокировку по ID
  async findById(id) {
    return await prisma.clientBlock.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        blockedByUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        unblockedByUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            appointmentTime: true,
          },
        },
      },
    });
  }

  // Найти активную блокировку по ID клиента
  async findActiveByClientId(clientId) {
    return await prisma.clientBlock.findFirst({
      where: {
        clientId,
        isActive: true,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        blockedByUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  // Найти все активные блокировки
  async findActive() {
    return await prisma.clientBlock.findMany({
      where: {
        isActive: true,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        blockedByUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            appointmentTime: true,
            service: {
              select: {
                id: true,
                name: true,
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

  // Найти все блокировки клиента
  async findByClientId(clientId) {
    return await prisma.clientBlock.findMany({
      where: {
        clientId,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        blockedByUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        unblockedByUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            appointmentTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Обновить блокировку
  async update(id, updateData) {
    return await prisma.clientBlock.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        blockedByUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        unblockedByUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            appointmentTime: true,
          },
        },
      },
    });
  }
}

module.exports = new ClientBlockRepository();
