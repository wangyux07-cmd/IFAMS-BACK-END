const { validationResult } = require('express-validator');

module.exports = (checks) => async (req, res, next) => {
  await Promise.all(checks.map((c) => c.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ code: 400, msg: 'Validation error', data: errors.array() });
  next();
};
