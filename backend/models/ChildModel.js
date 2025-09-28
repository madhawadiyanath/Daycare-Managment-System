const mongoose = require('mongoose');

const ChildSchema = new mongoose.Schema({
  childId: { type: String, required: true, unique: true, trim: true }, // Staff-provided ID
  name: { type: String, required: true, trim: true },
  age: { type: String, required: true, trim: true },
  gender: { type: String, required: true, trim: true },
  parent: { type: String, required: true, trim: true },
  healthNotes: { type: String, trim: true },
  // Basic Daily Routine
  checkInTime: { type: String, trim: true },
  checkOutTime: { type: String, trim: true },
  meals: { type: String, trim: true },
  napTimes: { type: String, trim: true },
  // Health & Safety
  healthStatus: { type: String, trim: true },
  incidents: { type: String, trim: true },
  medication: { type: String, trim: true },
  // Behavior & Social Updates
  moodBehavior: { type: String, trim: true },
  interactions: { type: String, trim: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Child', ChildSchema);
