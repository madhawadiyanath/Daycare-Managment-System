const express = require('express');
const router = express.Router();
const { createInventoryManager, getInventoryManagers, updateInventoryManager, deleteInventoryManager, loginInventoryManager } = require('../controllers/inventoryManagerController');

// Create
router.post('/', createInventoryManager);
// List
router.get('/', getInventoryManagers);
// Login
router.post('/login', loginInventoryManager);
// Update
router.put('/:id', updateInventoryManager);
// Delete
router.delete('/:id', deleteInventoryManager);

module.exports = router;
