const prisma = require('../config/database');

class AnalyticsRepository {
  /**
   * Получить финансовую аналитику за период
   */
  async getFinanceAnalytics(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Используем агрегацию Prisma для более эффективных запросов
    const [paymentsResult, expensesResult, refundsResult] = await Promise.all([
      // Общая выручка (сумма всех оплаченных платежей)
      prisma.payment.aggregate({
        where: {
          paymentDate: { gte: start, lte: end },
          status: 'PAID',
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),

      // Общие расходы
      prisma.expense.aggregate({
        where: {
          expenseDate: { gte: start, lte: end },
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),

      // Общие возвраты (только одобренные)
      prisma.refund.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          status: 'APPROVED',
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const totalRevenue = Number(paymentsResult._sum.amount || 0);
    const totalExpenses = Number(expensesResult._sum.amount || 0);
    const totalRefunds = Number(refundsResult._sum.amount || 0);
    const netProfit = totalRevenue - totalExpenses - totalRefunds;

    return {
      totalRevenue,
      totalExpenses,
      totalRefunds,
      netProfit,
      paymentCount: paymentsResult._count.id || 0,
      expenseCount: expensesResult._count.id || 0,
      refundCount: refundsResult._count.id || 0,
      period: {
        startDate: startDate,
        endDate: endDate,
      },
    };
  }

  /**
   * Получить детальные данные для экспорта
   */
  async getFinanceAnalyticsWithDetails(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Получаем аналитику
    const analytics = await this.getFinanceAnalytics(startDate, endDate);

    // Получаем все платежи с деталями
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: { gte: start, lte: end },
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

    // Получаем все расходы
    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: { gte: start, lte: end },
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    // Получаем все возвраты
    const refunds = await prisma.refund.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      analytics,
      payments,
      expenses,
      refunds,
    };
  }

  /**
   * Получить статистику по услугам за период
   */
  async getServiceStatistics(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: { gte: start, lte: end },
        status: 'PAID',
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
      },
    });

    // Группируем по услугам
    const serviceStats = {};
    payments.forEach(payment => {
      const serviceId = payment.appointment.service.id;
      const serviceName = payment.appointment.service.name;
      
      if (!serviceStats[serviceId]) {
        serviceStats[serviceId] = {
          serviceId,
          serviceName,
          count: 0,
          revenue: 0,
        };
      }
      
      serviceStats[serviceId].count++;
      serviceStats[serviceId].revenue += Number(payment.amount);
    });

    return Object.values(serviceStats).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Получить статистику по дням за период
   */
  async getDailyStatistics(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: { gte: start, lte: end },
        status: 'PAID',
      },
      select: {
        amount: true,
        paymentDate: true,
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: { gte: start, lte: end },
      },
      select: {
        amount: true,
        expenseDate: true,
      },
    });

    // Группируем по дням
    const dailyStats = {};
    
    payments.forEach(payment => {
      const dateKey = payment.paymentDate.toISOString().split('T')[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          revenue: 0,
          expenses: 0,
          profit: 0,
        };
      }
      dailyStats[dateKey].revenue += Number(payment.amount);
    });

    expenses.forEach(expense => {
      const dateKey = expense.expenseDate.toISOString().split('T')[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          revenue: 0,
          expenses: 0,
          profit: 0,
        };
      }
      dailyStats[dateKey].expenses += Number(expense.amount);
    });

    // Вычисляем прибыль
    Object.values(dailyStats).forEach(day => {
      day.profit = day.revenue - day.expenses;
    });

    return Object.values(dailyStats).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  }
}

module.exports = new AnalyticsRepository();



