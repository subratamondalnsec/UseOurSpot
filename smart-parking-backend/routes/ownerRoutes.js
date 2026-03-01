// Owner Routes — /api/owner
const express  = require('express');
const router   = express.Router();
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const {
  addSpot,
  getMySpots,
  getSpotById,
  editSpot,
  deleteSpot,
  getEarnings,
  getSpotStatus,
  getSpotBookings,
  getDashboardStats,
} = require('../controllers/ownerController');

// All routes require login + owner role
router.use(protect, authorizeRole('owner'));

// Dashboard and stats
router.get('/dashboard-stats',           getDashboardStats);

// Spot management
router.post('/add-spot',                 addSpot);
router.get('/my-spots',                  getMySpots);
router.get('/spot/:id',                  getSpotById);
router.put('/edit-spot/:id',             editSpot);
router.delete('/delete-spot/:id',        deleteSpot);
router.get('/spot-status/:id',           getSpotStatus);

// Earnings and bookings
router.get('/earnings',                  getEarnings);
router.get('/spot-bookings/:spotId',     getSpotBookings);

module.exports = router;
