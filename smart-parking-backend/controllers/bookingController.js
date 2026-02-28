const qrcode               = require('qrcode');
const sendEmail            = require('../utils/sendEmail');
const calculateDynamicPrice = require('../utils/dynamicPricing');
const ParkingSpot          = require('../models/ParkingSpot');
const Booking              = require('../models/Booking');

// ─── @route  POST /api/booking/create ───────────────────────
exports.createBooking = async (req, res) => {
  try {
    const { spotId, startTime, endTime, carLocation } = req.body;

    // Find spot and check availability
    const spot = await ParkingSpot.findById(spotId);
    if (!spot || spot.status === 'occupied') {
      return res.status(400).json({ success: false, message: 'Spot not available' });
    }

    // Calculate base amount using dynamic pricing
    const hours        = (new Date(endTime) - new Date(startTime)) / 3600000;
    const dynamicPrice = await calculateDynamicPrice(spot.pricePerHour, spotId);
    const baseAmount   = hours * dynamicPrice;

    // Create booking
    const booking = await Booking.create({
      driverId:      req.user._id,
      spotId,
      startTime:     new Date(startTime),
      endTime:       new Date(endTime),
      carLocation,
      baseAmount,
      finalAmount:   baseAmount,
      paymentStatus: 'paid',
      status:        'active',
    });

    // Generate QR code as data URL
    const qrDataURL = await qrcode.toDataURL(booking._id.toString());
    booking.qrCode  = qrDataURL;
    await booking.save();

    // Mark spot as occupied
    spot.status = 'occupied';
    await spot.save();

    // Send booking confirmation email
    try {
      const driver = req.user;
      await sendEmail({
        to:      driver.email,
        subject: 'Booking Confirmed — Smart Parking',
        html: `
          <h2>Booking Confirmed! 🚗</h2>
          <p>Hi ${driver.name},</p>
          <p>Your parking spot has been booked successfully.</p>
          <ul>
            <li><strong>Spot:</strong> ${spot.address}</li>
            <li><strong>From:</strong> ${new Date(startTime).toLocaleString()}</li>
            <li><strong>To:</strong> ${new Date(endTime).toLocaleString()}</li>
            <li><strong>Amount Paid:</strong> ₹${baseAmount.toFixed(2)}</li>
          </ul>
          <p>Your QR code is attached to your booking. Show it at the spot.</p>
        `,
      });
    } catch (emailErr) {
      console.error('Booking confirmation email failed:', emailErr.message);
    }

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('createBooking error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  POST /api/booking/scan-qr ──────────────────────
exports.scanQR = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('spotId')
      .populate('driverId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Booking not active' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('scanQR error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  POST /api/booking/end-session ──────────────────
exports.endSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const spot          = await ParkingSpot.findById(booking.spotId);
    const actualEndTime = new Date();
    booking.actualEndTime = actualEndTime;

    // Calculate overstay charge if ended late
    let overstayCharge = 0;
    if (actualEndTime > new Date(booking.endTime)) {
      const extraMs     = actualEndTime - new Date(booking.endTime);
      const extraHours  = extraMs / 3600000;
      overstayCharge    = extraHours * spot.pricePerHour;
    }

    booking.overstayCharge = overstayCharge;
    booking.finalAmount    = (booking.baseAmount || 0) + overstayCharge;
    booking.status         = 'completed';

    // Free up the spot
    spot.status = 'free';
    await spot.save();
    await booking.save();

    // Send receipt email
    try {
      const driver = await require('../models/User').findById(booking.driverId).select('name email');
      if (driver) {
        await sendEmail({
          to:      driver.email,
          subject: 'Parking Session Receipt — Smart Parking',
          html: `
            <h2>Session Complete 🏁</h2>
            <p>Hi ${driver.name}, here is your parking receipt.</p>
            <ul>
              <li><strong>Spot:</strong> ${spot.address}</li>
              <li><strong>Base Amount:</strong> ₹${(booking.baseAmount || 0).toFixed(2)}</li>
              <li><strong>Overstay Charge:</strong> ₹${overstayCharge.toFixed(2)}</li>
              <li><strong>Total Paid:</strong> ₹${booking.finalAmount.toFixed(2)}</li>
            </ul>
            <p>Thank you for using Smart Parking!</p>
          `,
        });
      }
    } catch (emailErr) {
      console.error('Receipt email failed:', emailErr.message);
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('endSession error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/booking/my-bookings ───────────────────
exports.myBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ driverId: req.user._id })
      .populate('spotId', 'address photos pricePerHour')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('myBookings error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  POST /api/booking/extend ───────────────────────
exports.extendTime = async (req, res) => {
  try {
    const { bookingId, extraMinutes } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, driverId: req.user._id, status: 'active' });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Active booking not found' });
    }

    const spot        = await ParkingSpot.findById(booking.spotId);
    const extraCharge = (extraMinutes / 60) * spot.pricePerHour;

    booking.baseAmount = (booking.baseAmount || 0) + extraCharge;
    booking.finalAmount = booking.baseAmount + (booking.overstayCharge || 0);
    booking.endTime    = new Date(new Date(booking.endTime).getTime() + extraMinutes * 60000);

    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    console.error('extendTime error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  POST /api/booking/rate ─────────────────────────
exports.rateSpot = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Verify the booking belongs to this user and is completed
    const booking = await Booking.findOne({
      _id:      bookingId,
      driverId: req.user._id,
      status:   'completed',
    });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Completed booking not found' });
    }

    const spot = await ParkingSpot.findById(booking.spotId);
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    // Push rating
    spot.ratings.push({ userId: req.user._id, rating, comment });

    // Recalculate average
    const total = spot.ratings.reduce((sum, r) => sum + r.rating, 0);
    spot.averageRating = total / spot.ratings.length;

    await spot.save();
    res.json({ success: true, averageRating: spot.averageRating });
  } catch (error) {
    console.error('rateSpot error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/booking/find-my-car/:bookingId ────────
exports.findMyCar = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id:      req.params.bookingId,
      driverId: req.user._id,
    }).populate('spotId', 'address');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!booking.carLocation || !booking.carLocation.lat || !booking.carLocation.lng) {
      return res.status(404).json({
        success: false,
        message: 'Car location not saved for this booking',
      });
    }

    res.json({
      success: true,
      carLocation: booking.carLocation,
      spotAddress: booking.spotId?.address,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error('findMyCar error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
