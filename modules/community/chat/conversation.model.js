const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["direct", "group"],
            required: true
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        // For direct chats (marketplace)
        relatedProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        // For group chats (ride events)
        relatedEvent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RideEvent"
        },
        groupName: {
            type: String
        },
        groupImage: {
            type: String
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        lastMessage: {
            content: String,
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            timestamp: Date
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ relatedEvent: 1 });
conversationSchema.index({ relatedProduct: 1, participants: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
