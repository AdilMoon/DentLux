const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Специфичные маршруты должны быть перед общими
// Получить мои записи (клиент)
router.get('/my', appointmentController.getMy);

// Получить записи доктора (только для докторов)
router.get('/doctor', appointmentController.getDoctorAppointments);

// Получить все записи (только для админа) - должен быть после специфичных маршрутов
router.get('/', roleMiddleware('ADMIN'), appointmentController.getAll);

// Создать запись (только для клиентов)
router.post('/', appointmentController.create);

// Обновить статус
router.patch('/:id/status', appointmentController.updateStatus);

// Отменить запись
router.delete('/:id', appointmentController.cancel);

module.exports = router;



