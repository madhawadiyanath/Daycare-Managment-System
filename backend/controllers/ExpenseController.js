const Expense = require('../models/ExpenseModel');

// Get all expenses
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses: expenses
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense records',
      error: error.message
    });
  }
};

// Get single expense by ID
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      expense: expense
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense record',
      error: error.message
    });
  }
};

// Create new expense
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    // Validation
    if (!title || !amount || !category || !date || !description) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate amount is positive
    if (amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount cannot be negative'
      });
    }

    // Validate title format (no numbers or symbols like @)
    const titleRegex = /^[A-Za-z\s.,'-]+$/;
    if (!titleRegex.test(title)) {
      return res.status(400).json({
        success: false,
        message: 'Title can only contain letters, spaces, and basic punctuation'
      });
    }

    const newExpense = new Expense({
      title,
      amount: parseFloat(amount),
      category,
      date: new Date(date),
      description
    });

    const savedExpense = await newExpense.save();
    
    res.status(201).json({
      success: true,
      message: 'Expense record created successfully',
      expense: savedExpense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create expense record',
      error: error.message
    });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    // Validation
    if (!title || !amount || !category || !date || !description) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate amount is positive
    if (amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount cannot be negative'
      });
    }

    // Validate title format
    const titleRegex = /^[A-Za-z\s.,'-]+$/;
    if (!titleRegex.test(title)) {
      return res.status(400).json({
        success: false,
        message: 'Title can only contain letters, spaces, and basic punctuation'
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        title,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        description
      },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense record updated successfully',
      expense: updatedExpense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update expense record',
      error: error.message
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense record deleted successfully',
      expense: deletedExpense
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense record',
      error: error.message
    });
  }
};

// Get expense statistics
const getExpenseStats = async (req, res) => {
  try {
    const totalExpense = await Expense.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const monthlyStats = await Expense.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalExpense[0] || { total: 0, count: 0 },
        byCategory: categoryStats,
        byMonth: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
};
