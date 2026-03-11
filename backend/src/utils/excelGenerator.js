const ExcelJS = require('exceljs');

/**
 * Генерация Excel файла с финансовой аналитикой
 */
async function generateAnalyticsExcel(analytics, payments, expenses, refunds) {
  const workbook = new ExcelJS.Workbook();
  
  // Стили
  const headerStyle = {
    font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  const titleStyle = {
    font: { bold: true, size: 16 },
    alignment: { horizontal: 'center' }
  };

  // Лист 1: Сводка
  const summarySheet = workbook.addWorksheet('Жиыны');
  summarySheet.columns = [
    { width: 30 },
    { width: 20 }
  ];

  summarySheet.mergeCells('A1:B1');
  summarySheet.getCell('A1').value = 'Қаржылық талдау';
  summarySheet.getCell('A1').style = titleStyle;

  summarySheet.getRow(3).values = ['Көрсеткіш', 'Сома (₸)'];
  summarySheet.getRow(3).font = { bold: true };

  summarySheet.getCell('A4').value = 'Жалпы кіріс';
  summarySheet.getCell('B4').value = analytics.totalRevenue;
  summarySheet.getCell('B4').numFmt = '#,##0.00';

  summarySheet.getCell('A5').value = 'Шығындар';
  summarySheet.getCell('B5').value = analytics.totalExpenses;
  summarySheet.getCell('B5').numFmt = '#,##0.00';

  summarySheet.getCell('A6').value = 'Қайтарулар';
  summarySheet.getCell('B6').value = analytics.totalRefunds;
  summarySheet.getCell('B6').numFmt = '#,##0.00';

  summarySheet.getCell('A7').value = 'Таза пайда';
  summarySheet.getCell('B7').value = analytics.netProfit;
  summarySheet.getCell('B7').numFmt = '#,##0.00';
  summarySheet.getCell('B7').font = { bold: true, color: { argb: 'FF008000' } };

  summarySheet.getCell('A9').value = 'Кезең:';
  summarySheet.getCell('B9').value = `${analytics.period.startDate} - ${analytics.period.endDate}`;

  // Лист 2: Платежи
  const paymentsSheet = workbook.addWorksheet('Төлемдер');
  paymentsSheet.columns = [
    { width: 15 }, // ID
    { width: 20 }, // Дата
    { width: 30 }, // Услуга
    { width: 15 }, // Сумма
    { width: 15 }  // Статус
  ];

  paymentsSheet.getRow(1).values = ['ID', 'Күні', 'Қызмет', 'Сома (₸)', 'Статус'];
  paymentsSheet.getRow(1).style = headerStyle;

  payments.forEach((payment, index) => {
    const row = paymentsSheet.getRow(index + 2);
    const statusMap = {
      'PAID': 'Төленген',
      'PENDING': 'Күтуде',
      'FAILED': 'Сәтсіз',
      'REFUNDED': 'Қайтарылған'
    };
    row.values = [
      payment.id.substring(0, 8),
      new Date(payment.paymentDate).toLocaleDateString('kk-KZ'),
      payment.appointment?.service?.name || '',
      Number(payment.amount),
      statusMap[payment.status] || payment.status
    ];
    row.getCell(4).numFmt = '#,##0.00';
  });

  // Лист 3: Расходы
  const expensesSheet = workbook.addWorksheet('Шығындар');
  expensesSheet.columns = [
    { width: 15 }, // Дата
    { width: 20 }, // Категория
    { width: 40 }, // Описание
    { width: 15 }  // Сумма
  ];

  expensesSheet.getRow(1).values = ['Күні', 'Санат', 'Сипаттама', 'Сома (₸)'];
  expensesSheet.getRow(1).style = headerStyle;

  expenses.forEach((expense, index) => {
    const row = expensesSheet.getRow(index + 2);
    row.values = [
      new Date(expense.expenseDate).toLocaleDateString('kk-KZ'),
      expense.category,
      expense.description || '',
      Number(expense.amount)
    ];
    row.getCell(4).numFmt = '#,##0.00';
  });

  // Лист 4: Возвраты
  const refundsSheet = workbook.addWorksheet('Қайтарулар');
  refundsSheet.columns = [
    { width: 15 }, // ID
    { width: 20 }, // Дата
    { width: 30 }, // Клиент
    { width: 15 }, // Сумма
    { width: 20 }, // Статус
    { width: 40 }  // Причина
  ];

  refundsSheet.getRow(1).values = ['ID', 'Күні', 'Клиент', 'Сома (₸)', 'Статус', 'Себеп'];
  refundsSheet.getRow(1).style = headerStyle;

  refunds.forEach((refund, index) => {
    const row = refundsSheet.getRow(index + 2);
    const statusMap = {
      'PENDING': 'Күтуде',
      'APPROVED': 'Бекітілген',
      'REJECTED': 'Бас тартылған'
    };
    row.values = [
      refund.id.substring(0, 8),
      new Date(refund.createdAt).toLocaleDateString('kk-KZ'),
      refund.client?.fullName || '',
      Number(refund.amount),
      statusMap[refund.status] || refund.status,
      refund.reason || ''
    ];
    row.getCell(4).numFmt = '#,##0.00';
  });

  return workbook;
}

module.exports = {
  generateAnalyticsExcel,
};

