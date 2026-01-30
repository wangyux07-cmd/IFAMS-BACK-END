const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) return res.status(400).json({ code:400, msg:'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ code:400, msg:'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'change_this_secret');
    const safeToken = String(token).replace(/\r?\n/g, '');
    res.set('Authorization', `Bearer ${safeToken}`);
    return success(res, { token: safeToken, user: { name: user.name } });
  } catch (err) {
    res.status(500).json({ code:500, msg:'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ code:400, msg:'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ code:400, msg:'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'change_this_secret');
    const safeToken = String(token).replace(/\r?\n/g, '');
    res.set('Authorization', `Bearer ${safeToken}`);
    return success(res, { token: safeToken, user: { name: user.name } });
  } catch (err) {
    res.status(500).json({ code:500, msg:'Server error' });
  }
};

exports.logout = async (req, res) => {
  // Stateless JWT: client should discard token. Implement server-side blacklist if needed.
  return success(res, null, 'Success');
};
