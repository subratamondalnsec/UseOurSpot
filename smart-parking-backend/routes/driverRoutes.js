const express = require('express');
const router = express.Router();

const { protect, authorizeRole } = require('../middleware/authMiddleware');
const { searchSpots, getSpot, addCarDetails } = require('../controllers/driverController');

// Protect all routes first
router.use(protect);

// Only drivers allowed
router.use(authorizeRole("driver"));

// GET /api/driver/search
router.get('/search', searchSpots);

// GET /api/driver/spot/:id
router.get('/spot/:id', getSpot);

// POST /api/driver/add-car
router.post('/add-car', addCarDetails);

module.exports = router;