const Joi = require("joi");

exports.createPostSchema = Joi.object({
    content: Joi.string().max(2000).allow("", null),

    images: Joi.array()
        .items(Joi.object({ url: Joi.string().optional() }))
        .optional(),
})
    .custom((value, helpers) => {

        const hasContent =
            value.content && value.content.trim() !== "";

        const hasImages =
            value.images && value.images.length > 0;

        if (!hasContent && !hasImages) {
            return helpers.error("any.invalid", {
                message: "Post must contain content or images"
            });
        }

        return value;
    });

exports.updatePostSchema = Joi.object({
    content: Joi.string()
        .max(2000)
        .allow("")
});

exports.postIdSchema = Joi.object({
    id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
});


exports.getPostsQuerySchema = Joi.object({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(50),
    keyword: Joi.string().allow(""),
    hashtag: Joi.string().allow(""),
    author: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    following: Joi.boolean(),
    sort: Joi.string()
});

exports.userIdSchema = Joi.object({
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
        "string.pattern.base": "Invalid user ID format",
    }),
});