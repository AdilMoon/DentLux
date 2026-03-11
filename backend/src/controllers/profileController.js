const profileService = require('../services/profileService');
const AppError = require('../utils/errors');
const fs = require('fs');
const path = require('path');

class ProfileController {
  // Получить текущий профиль
  async getProfile(req, res, next) {
    try {
      const profile = await profileService.getProfile(req.user.id);
      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновить профиль
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      
      // Пользователь может обновлять только свой профиль
      const profile = await profileService.updateProfile(userId, updateData);
      
      res.json({
        success: true,
        data: profile,
        message: 'Профиль сәтті жаңартылды',
      });
    } catch (error) {
      if (error.isOperational) {
        error.status = error.statusCode;
      }
      next(error);
    }
  }

  // Загрузить фото профиля
  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Файл не загружен',
        });
      }

      const userId = req.user.id;
      const filePath = `/uploads/${req.file.filename}`;

      // Удаляем старое фото, если оно есть
      const oldProfile = await profileService.getProfile(userId);
      if (oldProfile.avatarUrl) {
        const oldFilePath = path.join(__dirname, '../../', oldProfile.avatarUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Обновляем профиль с новым URL фото
      const profile = await profileService.updateAvatar(userId, filePath);

      res.json({
        success: true,
        data: profile,
        message: 'Фото сәтті жүктелді',
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
}

module.exports = new ProfileController();
