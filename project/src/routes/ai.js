const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const aiCtrl = require('../controllers/aiController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/chat', auth, validate([
	body('message').isString().notEmpty()
]), aiCtrl.chat);

module.exports = router;
