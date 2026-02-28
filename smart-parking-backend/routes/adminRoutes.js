// Admin Routes — /api/admin
const express  = require('express');
const router   = express.Router();
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const {
  getPendingSpots,
  approveSpot,
  removeSpot,
  getAllUsers,
  getHeatmap,
  getDashboardStats,
} = require('../controllers/adminController');

// All routes require login + admin role
router.use(protect, authorizeRole('admin'));

router.get('/pending-spots',        getPendingSpots);
router.put('/approve-spot/:id',     approveSpot);
router.delete('/remove-spot/:id',   removeSpot);
router.get('/users',                getAllUsers);
router.get('/heatmap',              getHeatmap);
router.get('/stats',                getDashboardStats);

module.exports = router;
