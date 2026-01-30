const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ code:401, msg:'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret');
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ code:401, msg:'Unauthorized' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ code:401, msg:'Invalid token' });
  }
};
