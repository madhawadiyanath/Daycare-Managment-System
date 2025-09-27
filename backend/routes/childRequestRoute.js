const express = require('express');
const router = express.Router();
const { submitChildRequest, listPendingRequests, approveRequest, rejectRequest } = require('../controllers/childRequestController');

// Parent submits new child details
router.post('/', submitChildRequest);

// Staff: list pending requests
router.get('/pending', listPendingRequests);

// Staff: approve request -> creates child and returns created child's id
router.post('/:id/approve', approveRequest);

// Staff: reject request
router.post('/:id/reject', rejectRequest);

module.exports = router;
