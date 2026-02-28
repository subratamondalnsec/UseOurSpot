const ParkingSpot = require('../models/ParkingSpot');

// ─── @route  GET /api/driver/search ─────────────────────────
// @access Private (driver)
exports.searchSpots = async (req, res) => {
  try {
    const { lat, lng, maxPrice, type, size } = req.query;

    // Find all approved and free spots
    const filter = {
      isApproved: true,
      status:     'free',
    };

    let spots = await ParkingSpot.find(filter);

    // If coordinates provided, calculate distance using Haversine formula
    if (lat && lng) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const R = 6371; // Earth radius in km

      spots = spots.map((spot) => {
        const spotLat = spot.coordinates?.lat || 0;
        const spotLng = spot.coordinates?.lng || 0;

        // Haversine formula
        const dLat = (spotLat - userLat) * Math.PI / 180;
        const dLng = (spotLng - userLng) * Math.PI / 180;
        
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(userLat * Math.PI / 180) * Math.cos(spotLat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km

        return { ...spot.toObject(), distance };
      });

      // Sort by distance (nearest first)
      spots.sort((a, b) => a.distance - b.distance);
    }

    // Apply optional filters
    if (maxPrice) {
      spots = spots.filter(spot => spot.pricePerHour <= Number(maxPrice));
    }
    if (type) {
      spots = spots.filter(spot => spot.type === type);
    }
    if (size) {
      spots = spots.filter(spot => spot.size === size);
    }

    res.json({ success: true, count: spots.length, spots });
  } catch (error) {
    console.error('searchSpots error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
