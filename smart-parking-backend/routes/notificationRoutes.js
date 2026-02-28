// Notification Routes — /api/notifications
// COMMENTED OUT - Not needed for current implementation

/*
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require('../controllers/notificationController');

// All routes require authentication
router.use(protect);

// GET /api/notifications — get all notifications for logged-in user
router.get('/', getMyNotifications);

// POST /api/notifications/create — create notification (admin/system only)
router.post('/create', createNotification);

// PUT /api/notifications/mark-read/:id — mark single notification as read
router.put('/mark-read/:id', markAsRead);

// PUT /api/notifications/mark-all-read — mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// DELETE /api/notifications/:id — delete single notification
router.delete('/:id', deleteNotification);

// DELETE /api/notifications — delete all notifications for user
router.delete('/', deleteAllNotifications);

module.exports = router;
*/
