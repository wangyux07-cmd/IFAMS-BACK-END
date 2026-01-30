const Asset = require('../models/Asset');

exports.profile = async (req, res) => {
  try {
    const user = req.user;
    const assets = await Asset.find({ userId: user._id });
    const totalNetWorth = assets.reduce((s, a) => s + (a.amount || 0), 0);
    const growthMetrics = { amount: 0, percent: 0, isPositive: true };
    const financialScore = Math.min(100, Math.round(50 + totalNetWorth / 1000));
    const { success } = require('../utils/apiResponse');
    return success(res, {
      username: user.name,
      userAvatar: user.avatar || null,
      totalNetWorth,
      financialScore,
      growthMetrics
    });
  } catch (err) {
    res.status(500).json({ code:500, msg:'Server error' });
  }
};
