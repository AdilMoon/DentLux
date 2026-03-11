const PDFDocument = require('pdfkit');

/**
 * Генерация PDF для плана лечения (Медициналық жазба)
 */
function generateTreatmentPDF(record, appointment, service, doctor, client) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
  });

  // Заголовок в индустриальном стиле
  doc.fontSize(24).text('DentLux', { align: 'center' });
  doc.moveDown(0.2);
  doc.fontSize(10).text('СТОМАТОЛОГИЯЛЫҚ КЛИНИКАСЫ', { align: 'center', characterSpacing: 2 });
  doc.moveDown(1);
  
  doc.fontSize(18).text('ЕМДЕУ ЖОСПАРЫ МЕН НӘТИЖЕСІ', { align: 'left', underline: true });
  doc.moveDown(1.5);

  // Информация о пациенте
  doc.fontSize(10).fillColor('#666666').text('ПАЦИЕНТ:');
  doc.fontSize(12).fillColor('#000000').text(`${client.fullName || client.full_name || 'Көрсетілмеген'}`);
  doc.moveDown(0.5);

  // Информация о враче
  doc.fontSize(10).fillColor('#666666').text('ДӘРІГЕР:');
  doc.fontSize(12).fillColor('#000000').text(`${doctor.fullName || doctor.name || 'Көрсетілмеген'}`);
  doc.moveDown(0.5);

  // Дата и время
  const appointmentDate = new Date(appointment.appointmentDate);
  doc.fontSize(10).fillColor('#666666').text('КҮНІ ЖӘНЕ УАҚЫТЫ:');
  doc.fontSize(12).fillColor('#000000').text(`${appointmentDate.toLocaleDateString('kk-KZ')} ${appointment.appointmentTime || ''}`);
  doc.moveDown(1.5);

  // Линия-разделитель (индустриальный стиль)
  doc.moveTo(50, doc.y).lineTo(550, doc.y).lineWidth(2).stroke();
  doc.moveDown(1);

  // Детали услуги
  doc.fontSize(14).text('ҚЫЗМЕТ:', { underline: false, bold: true });
  doc.fontSize(12).text(service.name);
  doc.moveDown(1);

  // Диагноз
  if (record.diagnosis) {
    doc.fontSize(14).text('ДИАГНОЗ:', { bold: true });
    doc.fontSize(12).text(record.diagnosis);
    doc.moveDown(1);
  }

  // Лечение
  if (record.treatment) {
    doc.fontSize(14).text('ЕМДЕУ ЖҰМЫСТАРЫ:', { bold: true });
    doc.fontSize(12).text(record.treatment);
    doc.moveDown(1);
  }

  // Назначения
  if (record.prescriptions) {
    doc.fontSize(14).text('ДӘРІ-ДӘРМЕКТЕР МЕН НҰСҚАУЛАР:', { bold: true });
    doc.fontSize(12).text(record.prescriptions);
    doc.moveDown(1);
  }

  // Примечания
  if (record.notes) {
    doc.fontSize(14).text('ЕСКЕРТПЕЛЕР:', { bold: true });
    doc.fontSize(12).text(record.notes);
    doc.moveDown(1);
  }

  // Подвал
  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).lineWidth(1).stroke();
  doc.moveDown(1);
  doc.fontSize(10).text('Бұл құжат DentLux жүйесінде автоматты түрде жасалған.', { align: 'center', italic: true });
  doc.text(`Жасалған күні: ${new Date().toLocaleString('kk-KZ')}`, { align: 'center' });

  return doc;
}

module.exports = {
  generateTreatmentPDF,
};
