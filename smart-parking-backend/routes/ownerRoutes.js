// Owner Routes — /api/owner
const express  = require('express');
const router   = express.Router();
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const {
  addSpot,
  getMySpots,
  editSpot,
  deleteSpot,
  getEarnings,
  getSpotStatus,
} = require('../controllers/ownerController');

// All routes require login + owner role
router.use(protect, authorizeRole('owner'));

router.post('/add-spot',            addSpot);
router.get('/my-spots',             getMySpots);
router.put('/edit-spot/:id',        editSpot);
router.delete('/delete-spot/:id',   deleteSpot);
router.get('/earnings',             getEarnings);
router.get('/spot-status/:id',      getSpotStatus);

module.exports = router;
