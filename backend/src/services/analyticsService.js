const analyticsRepository = require('../repositories/analyticsRepository');
const AppError = require('../utils/errors');

class AnalyticsService {
  /**
   * Получить финансовую аналитику
   */
  async getFinanceAnalytics(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new AppError('Даты начала и окончания периода обязательны', 400);
    }

    // Валидация дат
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError('Неверный формат даты', 400);
    }

    if (start > end) {
      throw new AppError('Дата начала не может быть позже даты окончания', 400);
    }

    try {
      const analytics = await analyticsRepository.getFinanceAnalytics(
        startDate,
        endDate
      );
      return analytics;
    } catch (error) {
      console.error('Ошибка при получении аналитики:', error);
      throw new AppError('Ошибка при получении аналитики: ' + error.message, 500);
    }
  }

  /**
   * Получить детальные данные для экспорта
   */
  async getFinanceAnalyticsWithDetails(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new AppError('Даты начала и окончания периода обязательны', 400);
    }

    try {
      const result = await analyticsRepository.getFinanceAnalyticsWithDetails(
        startDate,
        endDate
      );
      return result;
    } catch (error) {
      console.error('Ошибка при получении данных для экспорта:', error);
      throw new AppError('Ошибка при получении данных для экспорта: ' + error.message, 500);
    }
  }

  /**
   * Получить статистику по услугам
   */
  async getServiceStatistics(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new AppError('Даты начала и окончания периода обязательны', 400);
    }

    try {
      return await analyticsRepository.getServiceStatistics(startDate, endDate);
    } catch (error) {
      console.error('Ошибка при получении статистики по услугам:', error);
      throw new AppError('Ошибка при получении статистики по услугам', 500);
    }
  }

  /**
   * Получить дневную статистику
   */
  async getDailyStatistics(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new AppError('Даты начала и окончания периода обязательны', 400);
    }

    try {
      return await analyticsRepository.getDailyStatistics(startDate, endDate);
    } catch (error) {
      console.error('Ошибка при получении дневной статистики:', error);
      throw new AppError('Ошибка при получении дневной статистики', 500);
    }
  }
}

module.exports = new AnalyticsService();



