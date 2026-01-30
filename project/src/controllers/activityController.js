const Activity = require('../models/Activity');
const { format } = require('../utils/response');

exports.list = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user._id }).sort({ time: -1 }).limit(50);
    const { success } = require('../utils/apiResponse');
    return success(res, format(activities));
  } catch (err) {
    res.status(500).json({ code:500, msg:'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = Object.assign({}, req.body, { userId: req.user._id });
    const activity = await Activity.create(payload);
    const { success } = require('../utils/apiResponse');
    return success(res, format(activity));
  } catch (err) {
    res.status(500).json({ code:500, msg:'Server error' });
  }
};
