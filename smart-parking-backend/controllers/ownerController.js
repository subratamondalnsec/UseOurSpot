const cloudinary  = require('../config/cloudinary');
const ParkingSpot = require('../models/ParkingSpot');
const Booking     = require('../models/Booking');

// ─── @route  POST /api/owner/add-spot ───────────────────────
exports.addSpot = async (req, res) => {
  try {
    const {
      address, coordinates, size, type, rules,
      availability, availableFrom, availableTo, pricePerHour,
    } = req.body;

    // Upload photos to Cloudinary if provided
    const photos = [];
    if (req.files && req.files.photos) {
      const files = Array.isArray(req.files.photos)
        ? req.files.photos
        : [req.files.photos];

      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'parking-spots',
          resource_type: 'auto',
        });
        photos.push(result.secure_url);
      }
    }

    const spot = await ParkingSpot.create({
      ownerId: req.user._id,
      address,
      coordinates,
      size,
      type,
      rules,
      availability,
      availableFrom,
      availableTo,
      pricePerHour,
      photos,
    });

    res.status(201).json({ success: true, spot });
  } catch (error) {
    console.error('addSpot error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/owner/my-spots ────────────────────────
exports.getMySpots = async (req, res) => {
  try {
    const spots = await ParkingSpot.find({ ownerId: req.user._id });
    res.json({ success: true, spots });
  } catch (error) {
    console.error('getMySpots error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  PUT /api/owner/edit-spot/:id ───────────────────
exports.editSpot = async (req, res) => {
  try {
    let spot = await ParkingSpot.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    // If new photos uploaded → upload and replace array
    if (req.files && req.files.photos) {
      const files = Array.isArray(req.files.photos)
        ? req.files.photos
        : [req.files.photos];

      const photos = [];
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'parking-spots',
          resource_type: 'auto',
        });
        photos.push(result.secure_url);
      }
      req.body.photos = photos;
    }

    const allowedFields = [
      'address', 'coordinates', 'size', 'type', 'rules',
      'availability', 'availableFrom', 'availableTo',
      'pricePerHour', 'photos',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) spot[field] = req.body[field];
    });

    await spot.save();
    res.json({ success: true, spot });
  } catch (error) {
    console.error('editSpot error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  DELETE /api/owner/delete-spot/:id ──────────────
exports.deleteSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    await spot.deleteOne();
    res.json({ success: true, message: 'Spot deleted successfully' });
  } catch (error) {
    console.error('deleteSpot error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/owner/earnings ────────────────────────
exports.getEarnings = async (req, res) => {
  try {
    // Get all spots belonging to this owner
    const spots   = await ParkingSpot.find({ ownerId: req.user._id }).select('_id');
    const spotIds = spots.map((s) => s._id);

    // Find all bookings for those spots
    const bookings = await Booking.find({ spotId: { $in: spotIds } });

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.finalAmount || b.baseAmount || 0), 0);

    res.json({
      success: true,
      totalEarnings,
      bookingCount: bookings.length,
    });
  } catch (error) {
    console.error('getEarnings error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/owner/spot-status/:id ─────────────────
exports.getSpotStatus = async (req, res) => {
  try {
    const spot = await ParkingSpot.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    // Find current active booking (if any)
    const activeBooking = await Booking.findOne({
      spotId: spot._id,
      status: 'active',
    }).populate('userId', 'name email phone');

    res.json({
      success: true,
      status: spot.status,
      activeBooking: activeBooking || null,
    });
  } catch (error) {
    console.error('getSpotStatus error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/owner/spot/:id ────────────────────────
exports.getSpotById = async (req, res) => {
  try {
    const spot = await ParkingSpot.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }
    res.json({ success: true, spot });
  } catch (error) {
    console.error('getSpotById error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/owner/spot-bookings/:spotId ───────────
exports.getSpotBookings = async (req, res) => {
  try {
    // Verify the spot belongs to this owner
    const spot = await ParkingSpot.findOne({ _id: req.params.spotId, ownerId: req.user._id });
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    // Get all bookings for this spot
    const bookings = await Booking.find({ spotId: req.params.spotId })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('getSpotBookings error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/owner/dashboard-stats ─────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    // Get all spots belonging to this owner
    const spots = await ParkingSpot.find({ ownerId: req.user._id });
    const spotIds = spots.map((s) => s._id);

    // Get all bookings for those spots
    const bookings = await Booking.find({ spotId: { $in: spotIds } });

    // Calculate statistics
    const totalSpots = spots.length;
    const activeSpots = spots.filter((s) => s.status === 'free').length;
    const occupiedSpots = spots.filter((s) => s.status === 'occupied').length;
    
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter((b) => b.status === 'active').length;
    const completedBookings = bookings.filter((b) => b.status === 'completed').length;
    
    const totalEarnings = bookings.reduce((sum, b) => sum + (b.finalAmount || b.baseAmount || 0), 0);
    const pendingEarnings = bookings
      .filter((b) => b.status === 'active')
      .reduce((sum, b) => sum + (b.baseAmount || 0), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthEarnings = bookings
      .filter((b) => {
        const d = new Date(b.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, b) => sum + (b.finalAmount || b.baseAmount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalSpots,
        activeSpots,
        occupiedSpots,
        totalBookings,
        activeBookings,
        completedBookings,
        totalEarnings,
        pendingEarnings,
        thisMonthEarnings,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
