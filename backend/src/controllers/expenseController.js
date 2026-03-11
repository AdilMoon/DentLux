const expenseService = require('../services/expenseService');

class ExpenseController {
  // Создать расход
  async create(req, res, next) {
    try {
      const expense = await expenseService.createExpense(
        req.body,
        req.user.id
      );
      res.status(201).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  // Получить все расходы
  async getAll(req, res, next) {
    try {
      const expenses = await expenseService.getAllExpenses();
      res.json({
        success: true,
        data: expenses,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExpenseController();



