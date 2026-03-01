const razorpayInstance = require('../utils/razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');
const sendEmail = require('../utils/sendEmail');
const qrcode = require('qrcode');

// ─── @route  POST /api/payment/create-order ─────────────────
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: 'receipt_' + Date.now()
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error('createOrder error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  POST /api/payment/verify ───────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // If signature is invalid
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // If valid, update booking
    const booking = await Booking.findById(bookingId)
      .populate('driverId', 'name email phone')
      .populate('spotId', 'address pricePerHour');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Generate QR code
    const qrCode = await qrcode.toDataURL(bookingId);

    // Update booking
    booking.paymentStatus = 'paid';
    booking.qrCode = qrCode;
    await booking.save();

    // Update spot status
    await ParkingSpot.findByIdAndUpdate(
      booking.spotId,
      { status: 'occupied' }
    );

    // Send confirmation email
    try {
      const driver = booking.driverId;
      const spot = booking.spotId;
      
      await sendEmail({
        to: driver.email,
        subject: '✅ Booking Confirmed — SmartPark',
        html: `
          <div style="font-family:sans-serif;max-width:500px">
            <h2 style="color:#10b981">Booking Confirmed!</h2>
            <p>Hi ${driver.name},</p>
            <p>Your parking spot has been booked successfully.</p>
            <hr/>
            <p><b>Location:</b> ${spot.address}</p>
            <p><b>Start:</b> ${new Date(booking.startTime).toLocaleString()}</p>
            <p><b>End:</b> ${new Date(booking.endTime).toLocaleString()}</p>
            <p><b>Amount Paid:</b> ₹${booking.baseAmount}</p>
            <hr/>
            <p>Show QR code at parking entrance</p>
            <img src="${qrCode}" width="200" height="200"/>
            <p>Thank you for using SmartPark!</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Confirmation email failed:', emailErr.message);
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('verifyPayment error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
