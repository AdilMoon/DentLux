const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');

// Валидация вопроса к ИИ
const aiQuestionValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Хабарлама бос болмауы керек')
    .isLength({ max: 1000 })
    .withMessage('Хабарлама 1000 символдан аспауы керек'),
  handleValidationErrors,
];

// Роут для общения с ИИ (публичный)
router.post('/chat', aiQuestionValidation, aiController.chat.bind(aiController));

module.exports = router;
