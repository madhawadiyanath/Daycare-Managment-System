const Payment = require('../models/Payment');

// Create a new payment
const createPayment = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      address,
      package,
      amount,
      paymentMethod,
      cardNumber,
      expiryDate,
      cvv,
      nameOnCard,
      notes
    } = req.body;

    // Validate required fields
    if (!customerName || !email || !phone || !address || !package || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate package information
    const validPackages = {
      basic: { name: 'Basic', price: 89700 },
      premium: { name: 'Premium', price: 149700 },
      enterprise: { name: 'Enterprise', price: 239700 }
    };

    if (!validPackages[package.type] || validPackages[package.type].price !== amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package or amount'
      });
    }

    // Create payment object
    const paymentData = {
      customerName,
      email,
      phone,
      address,
      package,
      amount,
      paymentMethod,
      notes
    };

    // Add payment details based on method
    if (paymentMethod === 'credit-card') {
      if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
        return res.status(400).json({
          success: false,
          message: 'Card details are required for credit card payments'
        });
      }

      paymentData.paymentDetails = {
        cardNumber,
        expiryDate,
        cvv,
        nameOnCard
      };
    }

    // Create payment record
    const payment = new Payment(paymentData);
    await payment.save();

    // Return success response with masked payment info
    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      payment: payment.getMaskedPaymentInfo()
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find()
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('-paymentDetails.cvv'); // Exclude CVV from response

    const total = await Payment.countDocuments();

    res.json({
      success: true,
      payments: payments.map(payment => payment.getMaskedPaymentInfo()),
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment: payment.getMaskedPaymentInfo()
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get payment by receipt ID
const getPaymentByReceiptId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ receiptId: req.params.receiptId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment: payment.getMaskedPaymentInfo()
    });

  } catch (error) {
    console.error('Get payment by receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get payments by customer email
const getPaymentsByEmail = async (req, res) => {
  try {
    const payments = await Payment.find({ email: req.params.email })
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      payments: payments.map(payment => payment.getMaskedPaymentInfo())
    });

  } catch (error) {
    console.error('Get payments by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      payment: payment.getMaskedPaymentInfo()
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.getPaymentStats();
    
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyStats = await Payment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      stats: {
        packageStats: stats,
        totalPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyStats
      }
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete payment (soft delete by updating status)
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', notes: 'Payment cancelled by admin' },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment cancelled successfully'
    });

  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentByReceiptId,
  getPaymentsByEmail,
  updatePaymentStatus,
  getPaymentStats,
  deletePayment
};
