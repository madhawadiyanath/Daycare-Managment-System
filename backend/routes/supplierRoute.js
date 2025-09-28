const express = require('express');
const router = express.Router();
const { createsupplier, getsupplier, deletesupplier, updatesupplier, loginsupplier } = require('../controllers/supplierController');

// Create
router.post('/', createsupplier);
// List
router.get('/', getsupplier);
// Delete
router.delete('/:id', deletesupplier);
// Update
router.put('/:id', updatesupplier);

module.exports = router;
