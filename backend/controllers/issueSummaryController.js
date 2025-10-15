const IssueItem = require('../models/issueItem');
const InventoryItem = require('../models/inventoryItem');

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

// Controller to get detailed summary of issued items with inventory details
exports.getDetailedIssueSummary = async (req, res) => {
  try {
    const summary = await IssueItem.aggregate([
      {
        $group: {
          _id: { name: "$name", category: "$category" },
          totalIssued: { $sum: "$quantity" },
          lastIssueDate: { $max: "$issueDate" }
        }
      }
    ]);

    const detailedSummary = await Promise.all(
      summary.map(async (item) => {
        const inventoryDetails = await InventoryItem.findOne({
          name: item._id.name,
          category: item._id.category,
        });
        return {
          name: item._id.name,
          category: item._id.category,
          totalIssued: item.totalIssued,
          lastIssueDate: item.lastIssueDate,
          stock: inventoryDetails ? inventoryDetails.stock : null,
          expiry: inventoryDetails ? inventoryDetails.expiry : null,
          supplier: inventoryDetails ? inventoryDetails.supplier : null,
        };
      })
    );

    res.json({ success: true, data: detailedSummary });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get detailed issue summary' });
  }
};
