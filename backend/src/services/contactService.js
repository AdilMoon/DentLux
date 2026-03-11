const prisma = require('../config/database');
const emailService = require('../utils/emailService');
const AppError = require('../utils/errors');

class ContactService {
  // Отправить сообщение из контактной формы
  async submitContactMessage(data) {
    const { name, email, phone, message } = data;

    // Валидация
    if (!name || !email || !message) {
      throw new AppError('Аты-жөні, email және хабарлама міндетті', 400);
    }

    if (name.trim().length < 2) {
      throw new AppError('Аты-жөні кемінде 2 символ болуы керек', 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError('Email дұрыс емес', 400);
    }

    if (message.trim().length < 10) {
      throw new AppError('Хабарлама кемінде 10 символ болуы керек', 400);
    }

    // Сохраняем сообщение в БД
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        message: message.trim(),
      },
    });

    // Отправляем email администратору (если настроен SMTP)
    try {
      // Используем ADMIN_EMAIL из переменных окружения или klesr67@gmail.com по умолчанию
      const adminEmail = process.env.ADMIN_EMAIL || 'klesr67@gmail.com';
      if (adminEmail && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        await emailService.sendContactFormNotification(adminEmail, {
          name: contactMessage.name,
          email: contactMessage.email,
          phone: contactMessage.phone,
          message: contactMessage.message,
          id: contactMessage.id,
        });
        console.log(`✅ Email отправлен администратору: ${adminEmail}`);
      } else {
        console.warn('⚠️ SMTP не настроен. Email не будет отправлен. Добавьте SMTP_USER и SMTP_PASSWORD в .env файл.');
      }
    } catch (emailError) {
      // Не прерываем сохранение сообщения, если email не отправился
      console.error('❌ Ошибка отправки email уведомления администратору:', emailError.message || emailError);
    }

    return {
      id: contactMessage.id,
      name: contactMessage.name,
      email: contactMessage.email,
      createdAt: contactMessage.createdAt,
    };
  }

  // Получить все сообщения
  async getAllMessages() {
    return await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Отметить сообщение как прочитанное
  async markAsRead(id) {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new AppError('Хабарлама табылмады', 404);
    }

    return await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }
}

module.exports = new ContactService();
