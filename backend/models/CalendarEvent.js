const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  description: { type: String, trim: true },
  childId: { type: String, trim: true }, // optional: relate to a child
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
}, { timestamps: true });

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
