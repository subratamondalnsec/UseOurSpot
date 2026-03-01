// Booking Routes — /api/booking
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createBooking,
  getBooking,
  scanQR,
  endSession,
  myBookings,
  extendTime,
  rateSpot,
  findMyCar,
} = require('../controllers/bookingController');

// All routes require login
router.use(protect);

router.post('/create',                 createBooking);
router.get('/my-bookings',             myBookings);
router.get('/:id',                     getBooking);
router.post('/scan-qr',                scanQR);
router.post('/end-session',            endSession);
router.post('/extend',                 extendTime);
router.post('/rate',                   rateSpot);
router.get('/find-my-car/:bookingId',  findMyCar);

module.exports = router;
