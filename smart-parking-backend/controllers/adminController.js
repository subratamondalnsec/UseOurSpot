const User        = require('../models/User');
const ParkingSpot = require('../models/ParkingSpot');
const Booking     = require('../models/Booking');

// ─── @route  GET /api/admin/pending-spots ───────────────────
exports.getPendingSpots = async (req, res) => {
  try {
    const spots = await ParkingSpot.find({ isApproved: false })
      .populate('ownerId', 'name email');
    res.json({ success: true, spots });
  } catch (error) {
    console.error('getPendingSpots error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  PUT /api/admin/approve-spot/:id ────────────────
exports.approveSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    spot.isApproved = true;
    await spot.save();

    res.json({ success: true, message: 'Spot approved', spot });
  } catch (error) {
    console.error('approveSpot error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  DELETE /api/admin/remove-spot/:id ──────────────
exports.removeSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findByIdAndDelete(req.params.id);
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }
    res.json({ success: true, message: 'Spot removed successfully' });
  } catch (error) {
    console.error('removeSpot error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/admin/users ───────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error('getAllUsers error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/admin/heatmap ─────────────────────────
exports.getHeatmap = async (req, res) => {
  try {
    const spots = await ParkingSpot.find({ isApproved: true })
      .select('address coordinates status averageRating');
    res.json({ success: true, spots });
  } catch (error) {
    console.error('getHeatmap error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/admin/stats ───────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [userCount, spotCount, bookings] = await Promise.all([
      User.countDocuments(),
      ParkingSpot.countDocuments(),
      Booking.find().select('finalAmount'),
    ]);

    const totalRevenue  = bookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
    const bookingCount  = bookings.length;

    res.json({
      success: true,
      stats: {
        totalUsers:    userCount,
        totalSpots:    spotCount,
        totalBookings: bookingCount,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
