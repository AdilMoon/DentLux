const PDFDocument = require('pdfkit');

/**
 * Генерация PDF чека для платежа
 */
function generateReceiptPDF(payment, appointment, service, client) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
  });

  // Заголовок
  doc.fontSize(24).text('DentReserve Pro', { align: 'center' });
  doc.moveDown();
  doc.fontSize(18).text('ЧЕК ОБ ОПЛАТЕ', { align: 'center' });
  doc.moveDown(2);

  // Информация о клиенте
  doc.fontSize(12);
  doc.text(`Клиент: ${client.fullName || client.full_name || 'Не указано'}`);
  if (client.email) {
    doc.text(`Email: ${client.email}`);
  }
  if (client.phone) {
    doc.text(`Телефон: ${client.phone}`);
  }
  doc.moveDown();

  // Линия
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // Информация об услуге
  doc.fontSize(14).text('Детали услуги:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  doc.text(`Услуга: ${service.name}`);
  if (service.description) {
    doc.text(`Описание: ${service.description}`);
  }
  doc.moveDown();

  // Информация о записи
  doc.fontSize(14).text('Информация о записи:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);
  const appointmentDate = new Date(appointment.appointmentDate);
  doc.text(`Дата записи: ${appointmentDate.toLocaleDateString('ru-RU')}`);
  
  // Время записи
  let timeStr = '';
  if (appointment.appointmentTime) {
    const time = typeof appointment.appointmentTime === 'string' 
      ? appointment.appointmentTime 
      : appointment.appointmentTime.toTimeString().slice(0, 5);
    timeStr = time;
  }
  if (timeStr) {
    doc.text(`Время: ${timeStr}`);
  }
  doc.moveDown();

  // Линия
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // Сумма
  doc.fontSize(16);
  doc.text(`Сумма к оплате: ${Number(payment.amount).toLocaleString('ru-RU')} ₸`, {
    align: 'right',
  });
  doc.moveDown();

  // Статус
  doc.fontSize(12);
  const statusText = payment.status === 'PAID' ? 'ОПЛАЧЕНО' : 'В ожидании';
  doc.text(`Статус: ${statusText}`, { align: 'right' });
  doc.moveDown(2);

  // Дата платежа
  const paymentDate = new Date(payment.paymentDate);
  doc.fontSize(10);
  doc.text(`Дата оплаты: ${paymentDate.toLocaleString('ru-RU')}`, {
    align: 'center',
  });
  doc.text(`Номер платежа: ${payment.id}`, {
    align: 'center',
  });

  // Подвал
  doc.moveDown(3);
  doc.fontSize(10);
  doc.text('Спасибо за использование наших услуг!', { align: 'center' });

  return doc;
}

module.exports = {
  generateReceiptPDF,
};



