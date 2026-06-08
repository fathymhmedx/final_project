const Joi = require("joi");

const productIdSchema = Joi.object({
    productId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex": "Invalid product id",
            "string.length": "Invalid product id",
            "any.required": "Product id is required",
        }),
});

exports.addWishlistSchema = productIdSchema;
exports.removeWishlistSchema = productIdSchema;