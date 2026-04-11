const express = require('express');
const router = express.Router();
const { geminiProxy } = require('../controllers/automationController');

router.post('/gemini', geminiProxy);

module.exports = router;
