// Parking Spot Routes — /api/spots
const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { parseUpload, uploadToRemote } = require('../middleware/upload');
// const { getSpots, getSpot, createSpot, updateSpot, deleteSpot, getNearbySpots } = require('../controllers/spotController');

// GET  /api/spots          — list all verified spots
router.get('/', (req, res) => res.json({ message: 'GET all spots — controller coming soon' }));

// GET  /api/spots/nearby   — real-time map: spots near coordinates
router.get('/nearby', (req, res) => res.json({ message: 'GET nearby spots — controller coming soon' }));

// GET  /api/spots/:id
router.get('/:id', (req, res) => res.json({ message: 'GET spot by id — controller coming soon' }));

// POST /api/spots — owner creates a spot with photo upload (protected, owner only)
// parseUpload('photo') parses multipart file, uploadToRemote posts via file-uploader
router.post(
  '/',
  protect,
  authorize('owner'),
  parseUpload('photo'),
  async (req, res, next) => {
    try {
      let photoUrl = null;
      if (req.uploadedFile) {
        const result = await uploadToRemote(req.uploadedFile.path);
        photoUrl = result?.url || req.uploadedFile.filename;
      }
      // TODO: replace with createSpot controller — pass photoUrl to model
      res.json({ message: 'POST create spot — controller coming soon', photoUrl });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/spots/:id — owner updates spot with optional new photo (protected, owner only)
router.put(
  '/:id',
  protect,
  authorize('owner'),
  parseUpload('photo'),
  async (req, res, next) => {
    try {
      let photoUrl = null;
      if (req.uploadedFile) {
        const result = await uploadToRemote(req.uploadedFile.path);
        photoUrl = result?.url || req.uploadedFile.filename;
      }
      // TODO: replace with updateSpot controller
      res.json({ message: 'PUT update spot — controller coming soon', photoUrl });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/spots/:id — owner deletes spot (protected, owner only)
router.delete('/:id', protect, authorize('owner'), (req, res) =>
  res.json({ message: 'DELETE spot — controller coming soon' })
);

module.exports = router;
