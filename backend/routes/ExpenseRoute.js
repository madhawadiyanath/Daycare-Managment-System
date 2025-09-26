const express = require('express');
const router = express.Router();
const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
} = require('../controllers/ExpenseController');

// GET /api/expenses - Get all expenses
router.get('/', getAllExpenses);

// GET /api/expenses/stats - Get expense statistics
router.get('/stats', getExpenseStats);

// GET /api/expenses/:id - Get single expense by ID
router.get('/:id', getExpenseById);

// POST /api/expenses - Create new expense
router.post('/', createExpense);

// PUT /api/expenses/:id - Update expense
router.put('/:id', updateExpense);

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', deleteExpense);

module.exports = router;
