const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s.,'-]+$/.test(v);
      },
      message: 'Customer name should only contain letters, spaces, and basic punctuation'
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v.replace(/\D/g, ''));
      },
      message: 'Phone number must be 10 digits'
    }
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  package: {
    type: {
      type: String,
      required: true,
      enum: ['basic', 'premium', 'enterprise']
    },
    name: {
      type: String,
      required: true,
      enum: ['Basic', 'Premium', 'Enterprise']
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    features: [{
      type: String,
      required: true
    }]
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit-card', 'bank-transfer']
  },
  paymentDetails: {
    // For credit card payments
    cardNumber: {
      type: String,
      validate: {
        validator: function(v) {
          if (this.paymentMethod === 'credit-card') {
            return v && /^\d{16}$/.test(v.replace(/\s/g, ''));
          }
          return true;
        },
        message: 'Card number must be 16 digits'
      }
    },
    expiryDate: {
      type: String,
      validate: {
        validator: function(v) {
          if (this.paymentMethod === 'credit-card') {
            return v && /^(0[1-9]|1[0-2])\/\d{2}$/.test(v);
          }
          return true;
        },
        message: 'Expiry date must be in MM/YY format'
      }
    },
    cvv: {
      type: String,
      validate: {
        validator: function(v) {
          if (this.paymentMethod === 'credit-card') {
            return v && /^\d{3,4}$/.test(v);
          }
          return true;
        },
        message: 'CVV must be 3 or 4 digits'
      }
    },
    nameOnCard: {
      type: String,
      validate: {
        validator: function(v) {
          if (this.paymentMethod === 'credit-card') {
            return v && v.trim().length > 0;
          }
          return true;
        },
        message: 'Name on card is required for card payments'
      }
    }
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  receiptId: {
    type: String,
    unique: true,
    default: function() {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      return `LN${timestamp}${random}`;
    }
  },
  transactionId: {
    type: String,
    unique: true,
    default: function() {
      return `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
    }
  },
  subscriptionStartDate: {
    type: Date,
    default: Date.now
  },
  subscriptionEndDate: {
    type: Date,
    default: function() {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() + 1);
      return startDate;
    }
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ email: 1 });
paymentSchema.index({ receiptId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ paymentDate: -1 });

// Pre-save middleware to mask sensitive card information
paymentSchema.pre('save', function(next) {
  if (this.paymentMethod === 'credit-card' && this.paymentDetails.cardNumber) {
    // Mask card number (keep only last 4 digits)
    const cardNumber = this.paymentDetails.cardNumber.replace(/\s/g, '');
    this.paymentDetails.cardNumber = '**** **** **** ' + cardNumber.slice(-4);
    
    // Remove CVV for security
    this.paymentDetails.cvv = '***';
  }
  next();
});

// Instance method to get masked payment info
paymentSchema.methods.getMaskedPaymentInfo = function() {
  const payment = this.toObject();
  if (payment.paymentDetails && payment.paymentDetails.cardNumber) {
    payment.paymentDetails.cardNumber = '**** **** **** ' + payment.paymentDetails.cardNumber.slice(-4);
    payment.paymentDetails.cvv = '***';
  }
  return payment;
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$package.type',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    }
  ]);
  return stats;
};

module.exports = mongoose.model('Payment', paymentSchema);
