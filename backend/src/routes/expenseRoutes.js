const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN')); // Только админ может работать с расходами

// Создать расход
router.post('/', expenseController.create);

// Получить все расходы
router.get('/', expenseController.getAll);

module.exports = router;



