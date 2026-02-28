const express = require('express');
const router = express.Router();

const { protect, authorizeRole } = require('../middleware/authMiddleware');
const { searchSpots, addCarDetails } = require('../controllers/driverController');

// Protect all routes first
router.use(protect);

// Only drivers allowed
router.use(authorizeRole("driver"));

// GET /api/driver/search
router.get('/search', searchSpots);

// POST /api/driver/add-car
router.post('/add-car', addCarDetails);

module.exports = router;