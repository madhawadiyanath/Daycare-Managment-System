const express = require('express');
const router = express.Router();
const {
  createFinanceManager,
  getFinanceManagers,
  deleteFinanceManager,
  updateFinanceManager,
  loginFinanceManager,
} = require('../controllers/financeManagerController');

// Create
router.post('/', createFinanceManager);
// List
router.get('/', getFinanceManagers);
// Delete
router.delete('/:id', deleteFinanceManager);
// Update
router.put('/:id', updateFinanceManager);
// Login
router.post('/login', loginFinanceManager);

module.exports = router;
