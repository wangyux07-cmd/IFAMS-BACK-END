const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const auth = require('../middleware/auth');

const validate = (checks) => async (req, res, next) => {
	await Promise.all(checks.map((c) => c.run(req)));
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ code:400, msg:'Validation error', data: errors.array() });
	next();
};

router.post('/register', validate([
	body('name').isString().isLength({ min: 1 }),
	body('email').isEmail(),
	body('password').isLength({ min: 6 })
] ), authCtrl.register);

router.post('/login', validate([
	body('email').isEmail(),
	body('password').isLength({ min: 1 })
]), authCtrl.login);

router.post('/logout', auth, authCtrl.logout);

module.exports = router;
