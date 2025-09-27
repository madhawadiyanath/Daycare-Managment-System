const mongoose = require('mongoose');

const issueItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  issueDate: { type: Date, required: true },
});

module.exports = mongoose.model('IssueItem', issueItemSchema);
