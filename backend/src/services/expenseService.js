const expenseRepository = require('../repositories/expenseRepository');

class ExpenseService {
  // Создать расход
  async createExpense(data, createdBy) {
    const expense = await expenseRepository.create({
      ...data,
      expenseDate: new Date(data.date),
      createdBy,
    });
    return this.formatExpense(expense);
  }

  // Получить все расходы
  async getAllExpenses() {
    const expenses = await expenseRepository.findAll();
    return expenses.map(e => this.formatExpense(e));
  }

  // Форматировать расход
  formatExpense(expense) {
    return {
      id: expense.id,
      amount: Number(expense.amount),
      category: expense.category,
      description: expense.description,
      date: expense.expenseDate.toISOString().split('T')[0],
    };
  }
}

module.exports = new ExpenseService();
