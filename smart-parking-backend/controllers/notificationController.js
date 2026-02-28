// Notification Controller — Smart Parking System
// COMMENTED OUT - Not needed for current implementation

/* 
const Notification = require('../models/Notification');

// ─── @route  POST /api/notifications/create ─────────────────
// @access Private (system/admin)
// @desc   Create new notification for a user
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, relatedBooking } = req.body;

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedBooking,
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error('createNotification error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  GET /api/notifications ─────────────────────────
// @access Private
// @desc   Get all notifications for logged-in user
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('relatedBooking', 'spotId startTime endTime');

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('getMyNotifications error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  PUT /api/notifications/mark-read/:id ───────────
// @access Private
// @desc   Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    console.error('markAsRead error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  PUT /api/notifications/mark-all-read ───────────
// @access Private
// @desc   Mark all notifications as read for logged-in user
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllAsRead error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  DELETE /api/notifications/:id ──────────────────
// @access Private
// @desc   Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.deleteOne();
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('deleteNotification error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── @route  DELETE /api/notifications ──────────────────────
// @access Private
// @desc   Delete all notifications for logged-in user
exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'All notifications deleted' });
  } catch (error) {
    console.error('deleteAllNotifications error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Helper function to create notification (can be called from other controllers) ───
exports.sendNotification = async (userId, title, message, type, relatedBooking = null) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedBooking,
    });
  } catch (error) {
    console.error('sendNotification helper error:', error.message);
  }
};
*/
