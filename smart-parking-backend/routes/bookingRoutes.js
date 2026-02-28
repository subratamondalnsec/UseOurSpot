// Booking Routes — /api/bookings
const express = require('express');
const router = express.Router();

// POST /api/bookings              — driver creates booking + QR
router.post('/', (req, res) => res.json({ message: 'POST create booking — controller coming soon' }));

// GET  /api/bookings/my           — driver: my bookings
router.get('/my', (req, res) => res.json({ message: 'GET my bookings — controller coming soon' }));

// GET  /api/bookings/:id          — booking details
router.get('/:id', (req, res) => res.json({ message: 'GET booking by id — controller coming soon' }));

// PUT  /api/bookings/:id/cancel   — driver cancels
router.put('/:id/cancel', (req, res) => res.json({ message: 'PUT cancel booking — controller coming soon' }));

// PUT  /api/bookings/:id/checkin  — checkin via QR scan
router.put('/:id/checkin', (req, res) => res.json({ message: 'PUT checkin — controller coming soon' }));

// PUT  /api/bookings/:id/checkout — checkout + overstay charge
router.put('/:id/checkout', (req, res) => res.json({ message: 'PUT checkout — controller coming soon' }));

module.exports = router;
