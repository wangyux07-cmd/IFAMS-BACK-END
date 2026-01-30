const Asset = require('../models/Asset');
const { format } = require('../utils/response');

exports.list = async (req, res) => {
  try {
    const assets = await Asset.find({ userId: req.user._id });
    const { success } = require('../utils/apiResponse');
    return success(res, format(assets));
  } catch (err) {
    res.status(500).json({ code:500, msg:'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = Object.assign({}, req.body, { userId: req.user._id });
    const asset = await Asset.create(payload);
    const { success } = require('../utils/apiResponse');
    return success(res, format(asset));
  } catch (err) {
    res.status(500).json({ code:500, msg:'Server error' });
  }
};
