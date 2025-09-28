const Income = require('../models/IncomeModel');

// Get all incomes
const getAllIncomes = async (req, res) => {
  try {
    const incomes = await Income.find().sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: incomes.length,
      incomes: incomes
    });
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income records',
      error: error.message
    });
  }
};

// Get single income by ID
const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    
    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      income: income
    });
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income record',
      error: error.message
    });
  }
};

// Create new income
const createIncome = async (req, res) => {
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

    const newIncome = new Income({
      title,
      amount: parseFloat(amount),
      category,
      date: new Date(date),
      description
    });

    const savedIncome = await newIncome.save();
    
    res.status(201).json({
      success: true,
      message: 'Income record created successfully',
      income: savedIncome
    });
  } catch (error) {
    console.error('Error creating income:', error);
    
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
      message: 'Failed to create income record',
      error: error.message
    });
  }
};

// Update income
const updateIncome = async (req, res) => {
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

    const updatedIncome = await Income.findByIdAndUpdate(
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

    if (!updatedIncome) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Income record updated successfully',
      income: updatedIncome
    });
  } catch (error) {
    console.error('Error updating income:', error);
    
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
      message: 'Failed to update income record',
      error: error.message
    });
  }
};

// Delete income
const deleteIncome = async (req, res) => {
  try {
    const deletedIncome = await Income.findByIdAndDelete(req.params.id);

    if (!deletedIncome) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Income record deleted successfully',
      income: deletedIncome
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete income record',
      error: error.message
    });
  }
};

// Get income statistics
const getIncomeStats = async (req, res) => {
  try {
    const totalIncome = await Income.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Income.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const monthlyStats = await Income.aggregate([
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
        total: totalIncome[0] || { total: 0, count: 0 },
        byCategory: categoryStats,
        byMonth: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching income stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats
};