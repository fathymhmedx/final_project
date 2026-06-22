const Notification = require("./notifications.model");

/**
 * Creates a notification and emits it via Socket.IO if the user is online
 * @param {Object} io - Socket.IO instance attached to req.app
 * @param {Object} data - Notification data
 */
exports.createNotification = async (io, data) => {
    // Don't notify if sender is recipient
    if (data.sender.toString() === data.recipient.toString()) {
        return null;
    }

    try {
        const notification = await Notification.create(data);

        const populatedNotification = await Notification.findById(notification._id)
            .populate("sender", "name profileImage");

        // Emit via Socket.IO to the recipient's room
        if (io) {
            io.to(`user_${data.recipient}`).emit("new_notification", populatedNotification);
        }

        return populatedNotification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};
