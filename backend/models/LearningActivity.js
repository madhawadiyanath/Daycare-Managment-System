const mongoose = require('mongoose');

const LearningActivitySchema = new mongoose.Schema(
  {
    childId: { type: String, required: true, index: true },
    childName: { type: String, required: true },
    title: { type: String },
    date: { type: String }, // store ISO date string (YYYY-MM-DD)
    description: { type: String },
    recordedBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningActivity', LearningActivitySchema);
