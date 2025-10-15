const express = require('express');
const router = express.Router();
const { getIssueSummary, getDetailedIssueSummary } = require('../controllers/issueSummaryController');

// GET summary of issued items
router.get('/summary-issue', getIssueSummary);

// GET detailed summary of issued items
router.get('/detailed-summary-issue', getDetailedIssueSummary);

module.exports = router;
