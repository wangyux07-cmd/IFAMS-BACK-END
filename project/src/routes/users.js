const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/profile', auth, userCtrl.profile);

module.exports = router;
