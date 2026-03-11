const prisma = require('../config/database');

class PaymentRepository {
  // Создать платеж
  async create(appointmentId, amount, paymentMethod = 'CASH') {
    // Если оплата картой - сразу PAID, если наличными - PENDING (ждет подтверждения админа)
    const status = paymentMethod === 'CARD' ? 'PAID' : 'PENDING';
    
    return await prisma.payment.create({
      data: {
        appointmentId,
        amount,
        paymentMethod,
        status,
      },
      include: {
        appointment: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  // Найти по ID
  async findById(id) {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            service: true,
            client: { 
              select: { 
                id: true,
                fullName: true,
                email: true,
                phone: true,
              } 
            },
          },
        },
      },
    });
  }

  // Найти по appointment ID
  async findByAppointmentId(appointmentId) {
    return await prisma.payment.findUnique({
      where: { appointmentId },
    });
  }

  // Получить платежи клиента
  async findByClientId(clientId) {
    return await prisma.payment.findMany({
      where: {
        appointment: {
          clientId,
        },
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
        paymentDate: 'desc',
      },
    });
  }

  // Получить все платежи (для админа)
  async findAll() {
    return await prisma.payment.findMany({
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
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });
  }

  // Найти по gatewayTransactionId
  async findByGatewayTransactionId(transactionId) {
    return await prisma.payment.findFirst({
      where: { gatewayTransactionId: transactionId },
    });
  }

  // Обновить информацию о платежном шлюзе
  async updateGatewayInfo(paymentId, gatewayInfo) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        gatewayTransactionId: gatewayInfo.gatewayTransactionId || null,
        gatewayType: gatewayInfo.gatewayType || null,
        paymentUrl: gatewayInfo.paymentUrl || null,
        status: gatewayInfo.status || undefined,
      },
    });
  }

  // Обновить статус платежа
  async updateStatus(paymentId, status) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: { status },
      include: {
        appointment: {
          include: {
            service: true,
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  // Найти платежи по статусу
  async findByStatus(status) {
    return await prisma.payment.findMany({
      where: { status },
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
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });
  }
}

module.exports = new PaymentRepository();
