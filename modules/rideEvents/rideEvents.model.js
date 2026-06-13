const mongoose = require("mongoose");

const rideEventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000
        },

        coverImage: {
            type: String,
            default: ""
        },

        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "group",
                "meetup",
                "social",
                "workshop"
            ],
            default: "group"
        },

        meetingPoint: {
            type: String,
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        maxParticipants: {
            type: Number,
            default: 20
        },

        participants: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User"
            }
        ],

        participantsCount: {
            type: Number,
            default: 0
        },

        distance: {
            type: Number,
            default: 0
        },

        difficulty: {
            type: String,
            enum: [
                "easy",
                "medium",
                "hard"
            ],
            default: "easy"
        },

        isArchived: {
            type: Boolean,
            default: false
        }

    },
    {
        timestamps: true
    }
);

rideEventSchema.index({
    title: "text",
    description: "text"
});
const rideEvent = mongoose.model("RideEvent", rideEventSchema);

module.exports = rideEvent;