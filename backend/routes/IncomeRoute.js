const express = require('express');
const router = express.Router();
const {
  getAllIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats
} = require('../controllers/IncomeController');

// GET /api/incomes - Get all incomes
router.get('/', getAllIncomes);

// GET /api/incomes/stats - Get income statistics
router.get('/stats', getIncomeStats);

// GET /api/incomes/:id - Get single income by ID
router.get('/:id', getIncomeById);

// POST /api/incomes - Create new income
router.post('/', createIncome);

// PUT /api/incomes/:id - Update income
router.put('/:id', updateIncome);

// DELETE /api/incomes/:id - Delete income
router.delete('/:id', deleteIncome);

module.exports = router;