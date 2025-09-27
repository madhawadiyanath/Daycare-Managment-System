const express = require('express');
const router = express.Router();
const { createInventoryManager, getInventoryManagers, updateInventoryManager, deleteInventoryManager, loginInventoryManager, createInventoryItem, getInventoryItems, updateInventoryItem, deleteInventoryItem, issueInventoryItem } = require('../controllers/inventoryManagerController');
// Issue inventory item
router.post('/issue', issueInventoryItem);
// Delete inventory item
router.delete('/items/:id', deleteInventoryItem);

// Create
// Add inventory item
router.post('/items', createInventoryItem);
// Get all inventory items
router.get('/items', getInventoryItems);
// Update inventory item
router.put('/items/:id', updateInventoryItem);
// List
router.get('/', getInventoryManagers);
// Login
router.post('/login', loginInventoryManager);
// Update
router.put('/:id', updateInventoryManager);
// Delete
router.delete('/:id', deleteInventoryManager);

module.exports = router;
