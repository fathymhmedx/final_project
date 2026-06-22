const Joi = require("joi");

exports.createCommentSchema = Joi.object({
    content: Joi.string().max(500).required()
});

exports.updateCommentSchema = Joi.object({
    content: Joi.string().max(500).required()
});

exports.commentIdSchema = Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
        "string.pattern.base": "Invalid comment ID format",
    }),
});

exports.postIdParamSchema = Joi.object({
    postId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
        "string.pattern.base": "Invalid post ID format",
    }),
});

exports.getCommentsQuerySchema = Joi.object({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(50),
    sort: Joi.string()
});
