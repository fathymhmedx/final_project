const Notification = require("./notifications.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../../../shared/errors/ApiError");
const ApiFeatures = require("../../../shared/utils/apiFeatures");

/**
 * @desc Get My Notifications
 * @route GET /api/v1/community/notifications
 * @access Protected
 */
exports.getNotifications = asyncHandler(async (req, res) => {
    const features = new ApiFeatures(
        Notification.find({ recipient: req.user._id })
            .populate("sender", "name profileImage rank"),
        req.query
    ).sort();

    await features.paginate();
    const notifications = await features.query;

    res.status(200).json({
        status: "success",
        pagination: features.paginationResult,
        results: notifications.length,
        data: {
            notifications
        }
    });
});

/**
 * @desc Mark Notification as Read
 * @route PATCH /api/v1/community/notifications/:id/read
 * @access Protected
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user._id },
        { isRead: true },
        { new: true, runValidators: true }
    );

    if (!notification) {
        return next(new ApiError("Notification not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            notification
        }
    });
});

/**
 * @desc Mark All Notifications as Read
 * @route PATCH /api/v1/community/notifications/read-all
 * @access Protected
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        status: "success",
        message: "All notifications marked as read"
    });
});

/**
 * @desc Get Unread Count
 * @route GET /api/v1/community/notifications/unread-count
 * @access Protected
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false
    });

    res.status(200).json({
        status: "success",
        data: {
            count
        }
    });
});

/**
 * @desc Delete Notification
 * @route DELETE /api/v1/community/notifications/:id
 * @access Protected
 */
exports.deleteNotification = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipient: req.user._id
    });

    if (!notification) {
        return next(new ApiError("Notification not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Notification deleted successfully"
    });
});
