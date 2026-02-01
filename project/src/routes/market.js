const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const av = require('../services/alphavantage');

// GET /api/market/quote?symbol=NVDA
const { query } = require('express-validator');
const validate = require('../middleware/validate');
router.get('/quote', auth, validate([
  query('symbol').isString().notEmpty()
]), async (req, res) => {
  const symbol = (req.query.symbol || '').toUpperCase();
  const { error, success } = require('../utils/apiResponse');
  try {
    const data = await av.getQuote(symbol);
    return success(res, data);
  } catch (err) {
    const msg = err.message || 'Alpha Vantage error';
    return error(res, 500, msg, null);
  }
});

module.exports = router;
