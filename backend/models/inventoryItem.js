const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  expiry: { type: Date },
  supplier: { type: String },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: { type: Date, default: Date.now },
});

inventoryItemSchema.pre('save', function(next) {
  this.modifiedOn = new Date();
  next();
});

inventoryItemSchema.pre('findOneAndUpdate', function(next) {
  this.set({ modifiedOn: new Date() });
  next();
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
