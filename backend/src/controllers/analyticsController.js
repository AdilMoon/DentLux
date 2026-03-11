const analyticsService = require('../services/analyticsService');
const { generateAnalyticsExcel } = require('../utils/excelGenerator');
const AppError = require('../utils/errors');

class AnalyticsController {
  /**
   * Получить финансовую аналитику
   */
  async getFinance(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Басталу және аяқталу күні міндетті',
        });
      }

      const analytics = await analyticsService.getFinanceAnalytics(
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Экспорт в Excel
   */
  async exportExcel(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Басталу және аяқталу күні міндетті',
        });
      }

      // Получаем детальные данные
      const data = await analyticsService.getFinanceAnalyticsWithDetails(startDate, endDate);

      // Генерируем Excel файл
      const workbook = await generateAnalyticsExcel(
        data.analytics,
        data.payments,
        data.expenses,
        data.refunds
      );

      // Настраиваем ответ
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=analytics-${startDate}-${endDate}.xlsx`
      );

      // Отправляем файл
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить дневную статистику
   */
  async getDaily(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Басталу және аяқталу күні міндетті',
        });
      }

      const dailyStats = await analyticsService.getDailyStatistics(startDate, endDate);

      res.json({
        success: true,
        data: dailyStats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();

