const mongoose = require('mongoose');

const InventoryManagerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  phone: { type: String, trim: true },
  username: { type: String, required: true, trim: true, unique: true, minlength: 3, maxlength: 20 },
  password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });

module.exports = mongoose.model('InventoryManager', InventoryManagerSchema);
