const ParkingSpot = require('../models/ParkingSpot');
const User        = require('../models/User');
const Car        = require('../models/Car');

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

// ─── @route  GET /api/driver/spot/:id ───────────────────────
// @desc    Get single parking spot details
// @access  Private (driver)
exports.getSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id)
      .populate('ownerId', 'name email phone');

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }

    res.json({ success: true, spot });
  } catch (error) {
    console.error('getSpot error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addCarDetails = async (req, res) => {
  try {
    const { licensePlate, color, company, model, year } = req.body;

    const userId = req.user.id; // assuming auth middleware sets req.user

    // Check if license plate already exists
    const existingCar = await Car.findOne({ licensePlate });
    if (existingCar) {
      return res.status(400).json({
        success: false,
        message: "Car with this license plate already exists"
      });
    }

    // Create new car
    const newCar = await Car.create({
      licensePlate,
      color,
      company,
      model,
      year,
      owner: userId
    });

    // Add car reference to user
    await User.findByIdAndUpdate(
      userId,
      { $push: { cars: newCar._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Car added successfully",
      car: newCar
    });

  } catch (error) {
    console.error("Add Car Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// => /api/driver/add-car
// {
//   "licensePlate": "WB06AB1234",
//   "color": "White",
//   "company": "Toyota",
//   "model": "Innova",
//   "year": 2022
// }