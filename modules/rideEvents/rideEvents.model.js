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
            type: mongoose.Schema.Types.ObjectId,
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
            default: 20,
            min: 2
        },

        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        participantsCount: {
            type: Number,
            default: 0,
            min: 0
        },

        distance: {
            type: Number,
            default: 0,
            min: 0
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

rideEventSchema.index({
    isArchived: 1,
    startDate: 1
});

rideEventSchema.index({
    participants: 1,
    isArchived: 1
});
const rideEvent = mongoose.model("RideEvent", rideEventSchema);

module.exports = rideEvent;