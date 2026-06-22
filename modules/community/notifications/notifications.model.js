const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: [
                "like_post",
                "comment_post",
                "reply_comment",
                "follow",
                "like_comment",
                "new_message",
                "event_joined",
                "event_update"
            ],
            required: true
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation"
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RideEvent"
        },
        message: {
            type: String,
            required: true
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
