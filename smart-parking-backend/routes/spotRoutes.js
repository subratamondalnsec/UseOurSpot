// Parking Spot Routes — /api/spots
const express = require('express');
const router = express.Router();
// const { getSpots, getSpot, createSpot, updateSpot, deleteSpot, getNearbySpots } = require('../controllers/spotController');
// const { protect, authorize } = require('../middleware/auth');
// const upload = require('../middleware/upload');

// GET  /api/spots          — list all verified spots
router.get('/', (req, res) => res.json({ message: 'GET all spots — controller coming soon' }));

// GET  /api/spots/nearby   — real-time map: spots near coordinates
router.get('/nearby', (req, res) => res.json({ message: 'GET nearby spots — controller coming soon' }));

// GET  /api/spots/:id
router.get('/:id', (req, res) => res.json({ message: 'GET spot by id — controller coming soon' }));

// POST /api/spots          — owner creates a spot (protected, owner)
router.post('/', (req, res) => res.json({ message: 'POST create spot — controller coming soon' }));

// PUT  /api/spots/:id      — owner updates spot (protected, owner)
router.put('/:id', (req, res) => res.json({ message: 'PUT update spot — controller coming soon' }));

// DELETE /api/spots/:id   — owner deletes spot (protected, owner)
router.delete('/:id', (req, res) => res.json({ message: 'DELETE spot — controller coming soon' }));

module.exports = router;
