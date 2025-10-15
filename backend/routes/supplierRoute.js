const express = require('express');
const router = express.Router();
const { createsupplier, getsupplier, deletesupplier, updatesupplier, loginsupplier, searchSuppliers } = require('../controllers/supplierController');

// Create
router.post('/', createsupplier);
// List
router.get('/', getsupplier);
// Delete
router.delete('/:id', deletesupplier);
// Update
router.put('/:id', updatesupplier);
// Search suppliers by name
router.get('/search', searchSuppliers);

module.exports = router;
