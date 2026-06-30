const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            maxlength: 2000
        },
        image: {
            url: String
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Indexes
// Get messages in conversation
messageSchema.index({
    conversation: 1,
    createdAt: -1
});

// Get conversation messages + soft delete + sorting
messageSchema.index({
    conversation: 1,
    isDeleted: 1,
    createdAt: -1
});

// Unread messages lookup
messageSchema.index({
    conversation: 1,
    readBy: 1
});
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
