const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const activityCtrl = require('../controllers/activityController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', auth, activityCtrl.list);

router.post('/', auth, validate([
	body('title').isString().notEmpty(),
	body('category').isString().notEmpty(),
	body('amount').isString().notEmpty(),
	body('sourceAssetId').optional().isString()
]), activityCtrl.create);

module.exports = router;
