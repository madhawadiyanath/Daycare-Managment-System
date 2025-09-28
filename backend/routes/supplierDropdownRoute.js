const express = require('express');
const router = express.Router();
const Supplier = require('../models/SupplierModel');

// Get all suppliers (for dropdown)
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find({}, 'name'); // Only return name field
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
});

// ...existing CRUD endpoints (add, delete, etc.)

module.exports = router;
