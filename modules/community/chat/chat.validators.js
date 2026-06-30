const Joi = require("joi");

exports.startConversationSchema = Joi.object({
    participantId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    relatedProduct: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional()
});

exports.sendMessageSchema =
    Joi.object({
        content: Joi.string()
            .trim()
            .max(2000),

        image: Joi.any()
    })
        .or("content", "image");

exports.conversationIdSchema = Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
        "string.pattern.base": "Invalid conversation ID format",
    }),
});

exports.getMessagesQuerySchema = Joi.object({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(50)
});
