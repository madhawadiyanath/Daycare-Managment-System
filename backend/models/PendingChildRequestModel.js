const mongoose = require('mongoose');

const PendingChildRequestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: String, required: true, trim: true },
  gender: { type: String, required: true, trim: true },
  parent: { type: String, required: true, trim: true },
  healthNotes: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('PendingChildRequest', PendingChildRequestSchema);
