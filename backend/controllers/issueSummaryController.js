const IssueItem = require('../models/issueItem');

// Controller to get summary of issued items
exports.getIssueSummary = async (req, res) => {
  try {
    // Group by name+category, sum quantity, get latest issueDate
    const summary = await IssueItem.aggregate([
      {
        $group: {
          _id: { name: "$name", category: "$category" },
          totalIssued: { $sum: "$quantity" },
          lastIssueDate: { $max: "$issueDate" }
        }
      }
    ]);
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get issue summary' });
  }
};
