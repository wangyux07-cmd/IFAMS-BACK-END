const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const assetCtrl = require('../controllers/assetController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', auth, assetCtrl.list);

router.post('/', auth, validate([
	body('assetKey').isString().notEmpty(),
	body('name').isString().notEmpty(),
	body('institution').optional().isString(),
	body('amount').exists().bail().isNumeric(),
	body('currency').isString().notEmpty(),
	body('date').optional().isISO8601(),
	body('remarks').optional().isString(),
	body('attributes').optional().custom((v) => typeof v === 'object')
]), assetCtrl.create);

module.exports = router;
