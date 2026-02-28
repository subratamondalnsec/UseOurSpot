const ParkingSpot = require('../models/ParkingSpot');

// ─── @route  GET /api/driver/search ─────────────────────────
// @access Private (driver)
exports.searchSpots = async (req, res) => {
  try {
    const { lat, lng, maxPrice, type, size } = req.query;

    // Build filter
    const filter = {
      isApproved: true,
      status:     'free',
    };

    if (maxPrice) filter.pricePerHour = { $lte: Number(maxPrice) };
    if (type)     filter.type         = type;
    if (size)     filter.size         = size;

    let spots = await ParkingSpot.find(filter);

    // If coordinates provided, calculate distance and sort
    if (lat && lng) {
      const userLat = Number(lat);
      const userLng = Number(lng);

      spots = spots
        .map((spot) => {
          const sLat = spot.coordinates?.lat || 0;
          const sLng = spot.coordinates?.lng || 0;
          const distance = Math.sqrt(
            Math.pow(sLat - userLat, 2) + Math.pow(sLng - userLng, 2)
          );
          return { ...spot.toObject(), distance };
        })
        .sort((a, b) => a.distance - b.distance);
    }

    res.json({ success: true, count: spots.length, spots });
  } catch (error) {
    console.error('searchSpots error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
