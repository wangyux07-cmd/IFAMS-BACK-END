const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  category: String,
  time: { type: Date, default: Date.now },
  amount: String,
  icon: String,
  sourceAssetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);
