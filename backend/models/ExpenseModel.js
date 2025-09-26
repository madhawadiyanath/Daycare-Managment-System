const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
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
      values: ['Staff Salaries', 'Teacher Wages', 'Assistant Wages', 'Substitute Staff', 'Benefits & Insurance', 'Payroll Taxes', 'Rent & Utilities', 'Electricity Bills', 'Water Bills', 'Internet & Phone', 'Food & Snacks', 'Kitchen Supplies', 'Educational Materials', 'Toys & Games', 'Arts & Crafts Supplies', 'Books & Learning Resources', 'Cleaning Supplies', 'Diaper & Hygiene Products', 'First Aid Supplies', 'Office Supplies', 'Furniture & Equipment', 'Playground Maintenance', 'Vehicle Maintenance', 'Fuel Costs', 'Insurance Premiums', 'License & Permits', 'Training & Certification', 'Marketing & Advertising', 'Professional Services', 'Maintenance & Repairs', 'Other Expenses'],
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
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ title: 'text', description: 'text' });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
