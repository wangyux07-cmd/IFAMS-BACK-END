const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assetKey: String,
  name: String,
  institution: String,
  amount: { type: Number, default: 0 },
  currency: String,
  date: String,
  remarks: String,
  attributes: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Asset', AssetSchema);
