const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Создаем транспортер для отправки email
    // В development можно использовать тестовый аккаунт или реальный SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true для 465, false для других портов
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Отправка email для сброса пароля
  async sendPasswordResetEmail(email, resetToken, resetUrl) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      // В development режиме просто логируем
      console.log('📧 Password reset email (not sent - SMTP not configured):');
      console.log(`   To: ${email}`);
      console.log(`   Reset URL: ${resetUrl}`);
      console.log(`   Token: ${resetToken}`);
      return;
    }

    const mailOptions = {
      from: `"DentLux" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Парольді қалпына келтіру - DentLux',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Парольді қалпына келтіру</h2>
          <p>Сәлеметсіз бе!</p>
          <p>Сіз парольді қалпына келтіру үшін сұрау жібердіңіз. Төмендегі сілтемені басыңыз:</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Парольді қалпына келтіру
            </a>
          </p>
          <p>Егер сілтеме жұмыс істемесе, төмендегі мекенжайды браузеріңізге көшіріп қойыңыз:</p>
          <p style="color: #6b7280; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Ескерту: Бұл сілтеме 1 сағат бойы жарамды.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Егер сіз бұл сұрауды жібермеген болсаңыз, бұл хатты елемеңіз.
          </p>
        </div>
      `,
      text: `
        Парольді қалпына келтіру
        
        Сілтеме: ${resetUrl}
        
        Ескерту: Бұл сілтеме 1 сағат бойы жарамды.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Email жіберу қатесі');
    }
  }

  // Отправка уведомления о записи
  async sendAppointmentConfirmation(email, appointmentData) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('📧 Appointment confirmation email (not sent - SMTP not configured):');
      console.log(`   To: ${email}`);
      console.log(`   Appointment: ${appointmentData.serviceName} on ${appointmentData.date} at ${appointmentData.time}`);
      return;
    }

    const mailOptions = {
      from: `"DentLux" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Жазылу расталды - ${appointmentData.serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Жазылу расталды</h2>
          <p>Сәлеметсіз бе, ${appointmentData.clientName}!</p>
          <p>Сіздің жазылуыңыз сәтті құрылды.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Қызмет:</strong> ${appointmentData.serviceName}</p>
            <p><strong>Дәрігер:</strong> ${appointmentData.doctorName}</p>
            <p><strong>Күні:</strong> ${appointmentData.date}</p>
            <p><strong>Уақыты:</strong> ${appointmentData.time}</p>
            ${appointmentData.notes ? `<p><strong>Ескертпелер:</strong> ${appointmentData.notes}</p>` : ''}
          </div>
          <p>Кешікпей келіңіз!</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('❌ Error sending appointment confirmation email:', error);
    }
  }

  // Отправка уведомления об изменении статуса записи
  async sendAppointmentStatusUpdate(email, appointmentData, statusLabel) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('📧 Appointment status update email (not sent - SMTP not configured):');
      console.log(`   To: ${email}`);
      console.log(`   Status: ${statusLabel}`);
      return;
    }

    const mailOptions = {
      from: `"DentLux" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Жазылу статусы өзгерді - ${appointmentData.serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Жазылу статусы өзгерді</h2>
          <p>Сәлеметсіз бе, ${appointmentData.clientName}!</p>
          <p>Сіздің жазылуыңыздың статусы өзгерді: <strong>${statusLabel}</strong></p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Қызмет:</strong> ${appointmentData.serviceName}</p>
            <p><strong>Дәрігер:</strong> ${appointmentData.doctorName}</p>
            <p><strong>Күні:</strong> ${appointmentData.date}</p>
            <p><strong>Уақыты:</strong> ${appointmentData.time}</p>
            <p><strong>Жаңа статус:</strong> ${statusLabel}</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('❌ Error sending appointment status update email:', error);
    }
  }

  // Отправка уведомления об отмене записи
  async sendAppointmentCancellation(email, appointmentData) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('📧 Appointment cancellation email (not sent - SMTP not configured):');
      console.log(`   To: ${email}`);
      console.log(`   Appointment: ${appointmentData.serviceName} on ${appointmentData.date} at ${appointmentData.time}`);
      return;
    }

    const mailOptions = {
      from: `"DentLux" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Жазылу күшін жойылды - ${appointmentData.serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Жазылу күшін жойылды</h2>
          <p>Сәлеметсіз бе, ${appointmentData.clientName}!</p>
          <p>Сіздің жазылуыңыз күшін жойылды.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Қызмет:</strong> ${appointmentData.serviceName}</p>
            <p><strong>Дәрігер:</strong> ${appointmentData.doctorName}</p>
            <p><strong>Күні:</strong> ${appointmentData.date}</p>
            <p><strong>Уақыты:</strong> ${appointmentData.time}</p>
          </div>
          <p>Егер сіз жаңа жазылу жасағыңыз келсе, бізбен байланысыңыз.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('❌ Error sending appointment cancellation email:', error);
    }
  }

  // Отправка уведомления администратору о новом сообщении из контактной формы
  async sendContactFormNotification(adminEmail, messageData) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('📧 Contact form notification email (not sent - SMTP not configured):');
      console.log(`   To: ${adminEmail}`);
      console.log(`   From: ${messageData.name} (${messageData.email})`);
      console.log(`   Message: ${messageData.message.substring(0, 100)}...`);
      console.log('   ⚠️  Для настройки SMTP см. backend/SETUP_EMAIL.md');
      throw new Error('SMTP не настроен. Добавьте SMTP_USER и SMTP_PASSWORD в .env файл.');
    }

    const mailOptions = {
      from: `"DentLux Contact Form" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      replyTo: messageData.email, // Чтобы можно было ответить напрямую отправителю
      subject: `Жаңа хабарлама контакттық формадан - ${messageData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Жаңа хабарлама контакттық формадан</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Аты-жөні:</strong> ${this.escapeHtml(messageData.name)}</p>
            <p><strong>Email:</strong> <a href="mailto:${messageData.email}">${this.escapeHtml(messageData.email)}</a></p>
            ${messageData.phone ? `<p><strong>Телефон:</strong> <a href="tel:${messageData.phone}">${this.escapeHtml(messageData.phone)}</a></p>` : ''}
          </div>
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0;">Хабарлама:</h3>
            <p style="white-space: pre-wrap;">${this.escapeHtml(messageData.message)}</p>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            Хабарлама ID: ${messageData.id}
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Чтобы ответить на это сообщение, просто ответьте на это письмо или отправьте письмо на: <a href="mailto:${messageData.email}">${this.escapeHtml(messageData.email)}</a>
          </p>
        </div>
      `,
      text: `
        Жаңа хабарлама контакттық формадан
        
        Аты-жөні: ${messageData.name}
        Email: ${messageData.email}
        ${messageData.phone ? `Телефон: ${messageData.phone}` : ''}
        
        Хабарлама:
        ${messageData.message}
        
        ---
        Хабарлама ID: ${messageData.id}
        
        Чтобы ответить на это сообщение, отправьте письмо на: ${messageData.email}
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Contact form notification sent to ${adminEmail}`);
      console.log(`   Message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('❌ Error sending contact form notification:', error.message || error);
      // Пробрасываем ошибку дальше, чтобы contactService мог её обработать
      throw error;
    }
  }

  // Вспомогательная функция для экранирования HTML
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = new EmailService();
