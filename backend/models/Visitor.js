const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  path: { type: String, default: '/', index: true },
  page: { type: String, default: '/', index: true },
  userAgent: { type: String, default: 'unknown' },
  ipHash: { type: String, default: 'unknown' },
  device: { type: String, default: 'Desktop' },
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
