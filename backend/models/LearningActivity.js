const mongoose = require('mongoose');

const LearningActivitySchema = new mongoose.Schema(
  {
    childId: { type: String, required: true, index: true },
    childName: { type: String, required: true },
    title: { type: String },
    date: { type: String }, // store ISO date string (YYYY-MM-DD)
    description: { type: String },
    recordedBy: { type: String },
    // Progress tracking fields
    progressMetrics: {
      literacy: { type: Number, min: 0, max: 100, default: 0 }, // percentage
      mathematics: { type: Number, min: 0, max: 100, default: 0 },
      socialSkills: { type: Number, min: 0, max: 100, default: 0 },
      motorSkills: { type: Number, min: 0, max: 100, default: 0 },
      creativity: { type: Number, min: 0, max: 100, default: 0 }
    },
    notes: { type: String, trim: true }, // observations/notes for progress
    activityType: { 
      type: String, 
      enum: ['general', 'progress_update', 'assessment'], 
      default: 'general' 
    }
  },
  { timestamps: true }
);

// Index for better query performance
LearningActivitySchema.index({ childId: 1, date: -1 });
LearningActivitySchema.index({ childId: 1, activityType: 1 });

module.exports = mongoose.model('LearningActivity', LearningActivitySchema);
