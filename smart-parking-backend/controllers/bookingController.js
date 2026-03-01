const qrcode               = require('qrcode');
const sendEmail            = require('../utils/sendEmail');
const calculateDynamicPrice = require('../utils/dynamicPricing');
const ParkingSpot          = require('../models/ParkingSpot');
const Booking              = require('../models/Booking');

// ─── @route  POST /api/booking/create ───────────────────────
exports.createBooking = async (req, res) => {
  try {
    const { spotId, startTime, endTime, carLocation } = req.body;

    // Find spot
    const spot = await ParkingSpot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }
    if (spot.status === 'occupied') {
      return res.status(400).json({ success: false, message: 'Spot is already occupied' });
    }

    // Calculate base amount using dynamic pricing
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / 3600000;
    
    if (hours <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid time range' });
    }

    const dynamicPrice = await calculateDynamicPrice(spot.pricePerHour, spotId);
    const baseAmount = Math.ceil(hours * dynamicPrice);

    // Create booking (DO NOT change spot status - only after payment verified)
    const booking = await Booking.create({
      driverId: req.user._id,
      spotId,
      startTime: start,
      endTime: end,
      baseAmount,
      carLocation,
      paymentStatus: 'pending',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      bookingId: booking._id,
      baseAmount
    });
  } catch (error) {
    console.error('createBooking error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/booking/:id ───────────────────────────
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('spotId', 'address photos pricePerHour coordinates type rules')
      .populate('driverId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('getBooking error:', error.message);
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

    const booking = await Booking.findById(bookingId)
      .populate('spotId')
      .populate('driverId');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Session already ended' });
    }

    const now = new Date();
    const spot = booking.spotId;
    const driver = booking.driverId;

    // Check overstay
    if (now > new Date(booking.endTime)) {
      const extraMs = now.getTime() - new Date(booking.endTime).getTime();
      const extraHours = extraMs / 3600000;
      booking.overstayCharge = Math.ceil(extraHours * spot.pricePerHour);
    } else {
      booking.overstayCharge = 0;
    }

    booking.finalAmount = booking.baseAmount + booking.overstayCharge;
    booking.status = 'completed';
    booking.actualEndTime = now;
    spot.status = 'free';

    await booking.save();
    await spot.save();

    // Send receipt email
    try {
      await sendEmail({
        to: driver.email,
        subject: '🧾 Parking Receipt — SmartPark',
        html: `
          <div style="font-family:sans-serif;max-width:500px">
            <h2>Parking Receipt</h2>
            <p>Location: ${spot.address}</p>
            <p>Start: ${new Date(booking.startTime).toLocaleString()}</p>
            <p>End: ${now.toLocaleString()}</p>
            <hr/>
            <p>Base Amount: ₹${booking.baseAmount}</p>
            <p>Overstay Charge: ₹${booking.overstayCharge}</p>
            <h3>Total: ₹${booking.finalAmount}</h3>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Receipt email failed:', emailErr.message);
    }

    res.json({ 
      success: true, 
      booking,
      overstayCharge: booking.overstayCharge,
      finalAmount: booking.finalAmount
    });
  } catch (error) {
    console.error('endSession error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/booking/my-bookings ───────────────────
exports.myBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ driverId: req.user._id })
      .populate('spotId', 'address photos pricePerHour type coordinates')
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

    const spot = await ParkingSpot.findById(booking.spotId);
    const extraCharge = Math.ceil((extraMinutes / 60) * spot.pricePerHour);

    booking.baseAmount += extraCharge;
    booking.endTime = new Date(booking.endTime.getTime() + extraMinutes * 60000);

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
      _id: bookingId,
      driverId: req.user._id,
      status: 'completed'
    });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Completed booking not found' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Booking must be completed to rate' });
    }

    const spot = await ParkingSpot.findById(booking.spotId);
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    // Push rating
    spot.ratings.push({ userId: req.user._id, rating, comment });

    // Recalculate average
    const total = spot.ratings.reduce((sum, r) => sum + r.rating, 0);
    spot.averageRating = Number((total / spot.ratings.length).toFixed(1));

    await spot.save();
    res.json({ success: true, message: 'Rating submitted successfully' });
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
