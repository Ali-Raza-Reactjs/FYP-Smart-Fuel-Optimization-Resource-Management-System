const { ApiResponseModel } = require("../utils/classes");
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = notifications;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this notification');
    }

    notification.isRead = true;
    await notification.save();

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = notification;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = { success: true };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// Helper function to create notifications (called internally by other controllers)
exports.createNotification = async (userId, title, message, type = 'Info') => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};
