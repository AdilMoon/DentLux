const doctorService = require('../services/doctorService');
const fs = require('fs');
const path = require('path');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/errors');

// Контроллер для врачей
class DoctorController {
  // Получить всех врачей
  async getAll(req, res, next) {
    try {
      // Для публичного доступа и клиентов - скрываем заблокированных докторов
      // Для админа - показываем всех
      const userRole = req.user?.role;
      // Исключаем заблокированных для всех, кроме админов
      const excludeBlocked = userRole !== 'ADMIN';
      
      const doctors = await doctorService.getAllDoctors(excludeBlocked);
      res.status(200).json({
        success: true,
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  }

  // Создать доктора
  async create(req, res, next) {
    try {
      const doctor = await doctorService.createDoctor(req.body);
      res.status(201).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновить доктора
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const doctor = await doctorService.updateDoctor(id, req.body);
      res.json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  // Удалить доктора
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await doctorService.deleteDoctor(id);
      res.json({
        success: true,
        message: 'Доктор удален',
      });
    } catch (error) {
      next(error);
    }
  }

  // Загрузить фото доктора
  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Файл не загружен',
        });
      }

      const { id } = req.params;
      const filePath = `/uploads/${req.file.filename}`;

      // Проверяем, что пользователь существует и является доктором
      const user = await userRepository.findById(id);
      if (!user) {
        // Удаляем загруженный файл
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({
          success: false,
          error: 'Доктор не найден',
        });
      }

      // Удаляем старое фото, если оно есть
      if (user.avatarUrl) {
        const oldFilePath = path.join(__dirname, '../../', user.avatarUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Обновляем аватар пользователя
      await userRepository.update(id, { avatarUrl: filePath });

      // Получаем обновленного доктора
      const doctor = await doctorService.getAllDoctors();
      const updatedDoctor = doctor.find(d => d.id === id);

      res.json({
        success: true,
        data: updatedDoctor,
        message: 'Фото доктора сәтті жүктелді',
      });
    } catch (error) {
      // Удаляем загруженный файл в случае ошибки
      if (req.file && req.file.path) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Заблокировать доктора
  async blockDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const { blockedUntil } = req.body; // опционально: дата, до которой блокировать

      const blockedUntilDate = blockedUntil ? new Date(blockedUntil) : null;
      const doctor = await doctorService.blockDoctor(id, blockedUntilDate);

      res.json({
        success: true,
        data: doctor,
        message: 'Доктор заблокирован',
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Разблокировать доктора
  async unblockDoctor(req, res, next) {
    try {
      const { id } = req.params;

      const doctor = await doctorService.unblockDoctor(id);

      res.json({
        success: true,
        data: doctor,
        message: 'Доктор разблокирован',
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }
}

module.exports = new DoctorController();
