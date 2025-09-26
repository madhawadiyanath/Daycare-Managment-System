const express = require('express');
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentByReceiptId,
  getPaymentsByEmail,
  updatePaymentStatus,
  getPaymentStats,
  deletePayment
} = require('../controllers/paymentController');

// Create a new payment
router.post('/', createPayment);

// Get all payments with pagination
router.get('/', getAllPayments);

// Get payment statistics
router.get('/stats', getPaymentStats);

// Get payment by receipt ID
router.get('/receipt/:receiptId', getPaymentByReceiptId);

// Get payments by customer email
router.get('/email/:email', getPaymentsByEmail);

// Get payment by ID
router.get('/:id', getPaymentById);

// Update payment status
router.put('/:id/status', updatePaymentStatus);

// Delete payment (soft delete)
router.delete('/:id', deletePayment);

module.exports = router;
