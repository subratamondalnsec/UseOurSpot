const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/payment/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', protect, createOrder);

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment and update booking
// @access  Private
router.post('/verify', protect, verifyPayment);

module.exports = router;
