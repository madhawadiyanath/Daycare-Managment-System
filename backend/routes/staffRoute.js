const express = require('express');
const router = express.Router();
const { createStaff, getStaff, deleteStaff, updateStaff, loginStaff } = require('../controllers/staffController');

// Create
router.post('/', createStaff);
// List
router.get('/', getStaff);
// Delete
router.delete('/:id', deleteStaff);
// Update
router.put('/:id', updateStaff);
// Login
router.post('/login', loginStaff);

module.exports = router;
