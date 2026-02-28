// Driver Routes — /api/driver
const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { searchSpots } = require('../controllers/driverController');

// All routes require login
router.use(protect);

// GET /api/driver/search?lat=&lng=&maxPrice=&type=&size=
router.get('/search', searchSpots);

module.exports = router;
