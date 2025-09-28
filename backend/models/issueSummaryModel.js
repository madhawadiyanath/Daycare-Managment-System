const mongoose = require('mongoose');

const issueSummarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  totalIssued: { type: Number, required: true },
  lastIssueDate: { type: Date },
});

module.exports = mongoose.model('IssueSummary', issueSummarySchema);