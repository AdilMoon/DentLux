const prisma = require('../config/database');

class ExpenseRepository {
  // Создать расход
  async create(data) {
    return await prisma.expense.create({
      data,
      include: {
        createdByUser: { select: { fullName: true } },
      },
    });
  }

  // Получить все расходы
  async findAll() {
    return await prisma.expense.findMany({
      include: {
        createdByUser: { select: { fullName: true } },
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });
  }
}

module.exports = new ExpenseRepository();
