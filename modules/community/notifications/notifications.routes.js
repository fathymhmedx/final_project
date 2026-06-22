const express = require("express");
const router = express.Router();
const validate = require("../../../shared/middlewares/validation/validate.middleware");
const { protect } = require("../../../shared/middlewares/auth.middleware");

const {
    notificationIdSchema,
    getNotificationsQuerySchema
} = require("./notifications.validators");

const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification
} = require("./notifications.controller");

router.use(protect);

router.get("/", validate(getNotificationsQuerySchema, "query"), getNotifications);
router.patch("/read-all", markAllAsRead);
router.get("/unread-count", getUnreadCount);

router.patch("/:id/read", validate(notificationIdSchema, "params"), markAsRead);
router.delete("/:id", validate(notificationIdSchema, "params"), deleteNotification);

module.exports = router;
