const express = require('express');
const router = express.Router();
const { getIssueSummary } = require('../controllers/issueSummaryController');

// GET summary of issued items
router.get('/summary-issue', getIssueSummary);

module.exports = router;
