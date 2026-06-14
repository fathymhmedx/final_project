const Joi = require("joi");

exports.createRideEventSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required(),

    description: Joi.string()
        .trim()
        .max(1000),

    type: Joi.string()
        .valid(
            "group",
            "meetup",
            "social",
            "workshop"
        ),

    meetingPoint: Joi.string()
        .trim()
        .required(),

    startDate: Joi.date()
        .greater("now")
        .required(),

    maxParticipants: Joi.number()
        .integer()
        .min(2)
        .max(500),

    distance: Joi.number()
        .min(0),

    difficulty: Joi.string()
        .valid(
            "easy",
            "medium",
            "hard"
        ),
    coverImage: Joi.string().optional()
});

exports.updateRideEventSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(100),
    description: Joi.string()
        .trim()
        .max(1000),
    meetingPoint: Joi.string(),
    type: Joi.string()
        .valid(
            "group",
            "meetup",
            "social",
            "workshop"
        ),
    startDate: Joi.date(),
    maxParticipants: Joi.number()
        .integer()
        .min(2),
    distance: Joi.number(),
    difficulty: Joi.string()
        .valid(
            "easy",
            "medium",
            "hard"
        ),
    coverImage: Joi.string().optional()


}).min(1);

exports.eventIdSchema = Joi.object({
    id: Joi.string()
        .hex()
        .length(24)
        .required(),
});

exports.getEventsQuerySchema = Joi.object({
    page: Joi.number(),
    limit: Joi.number(),
    keyword: Joi.string(),
    sort: Joi.string(),
    type: Joi.string()
        .valid(
            "group",
            "meetup",
            "social",
            "workshop"
        ),
});