const Joi = require("joi");

exports.notificationIdSchema = Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
        "string.pattern.base": "Invalid notification ID format",
    }),
});

exports.getNotificationsQuerySchema = Joi.object({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(50)
});
