const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Only allow letters, spaces, and basic punctuation (no numbers or symbols like @)
        return /^[A-Za-z\s.,'-]+$/.test(v);
      },
      message: 'Title can only contain letters, spaces, and basic punctuation'
    }
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'Amount must be a positive number'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Monthly Tuition', 'Weekly Tuition', 'Daily Care Fees', 'Registration Fees', 'Late Pickup Fees', 'Activity Fees', 'Field Trip Fees', 'Meal & Snack Fees', 'Diaper & Supply Fees', 'Transportation Fees', 'Extended Hours Fees', 'Holiday Care Fees', 'Summer Program Fees', 'After School Program', 'Parent Donations', 'Fundraising Events', 'Government Subsidies', 'Childcare Vouchers', 'Insurance Reimbursements', 'Other Income'],
      message: 'Please select a valid category'
    }
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
incomeSchema.index({ date: -1 });
incomeSchema.index({ category: 1 });
incomeSchema.index({ title: 'text', description: 'text' });

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;