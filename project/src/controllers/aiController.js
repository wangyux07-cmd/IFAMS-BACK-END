const gemini = require('../services/gemini');
const { success, error } = require('../utils/apiResponse');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return error(res, 400, 'Missing message');
    try {
      const text = await gemini.generateText(message);
      return success(res, { text });
    } catch (err) {
      const reply = `Echo: ${message}`;
      return success(res, { text: reply, warning: err.message });
    }
  } catch (err) {
    return error(res, 500, 'Server error');
  }
};
