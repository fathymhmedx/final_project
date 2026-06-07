const Joi = require("joi");

/**
 * CREATE PRODUCT VALIDATION
 */
exports.createProductSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),

    description: Joi.string().min(10).required(),

    category: Joi.string()
        .valid("motorcycle", "parts", "accessories")
        .required(),

    price: Joi.number().min(0).required(),

    images: Joi.array().items(
        Joi.object({
            url: Joi.string().uri().required(),
        })
    ).optional(),

    condition: Joi.string().valid("new", "used").required(),

    location: Joi.string().required(),
});

/**
 * UPDATE PRODUCT VALIDATION
 */
exports.updateProductSchema = Joi.object({
    title: Joi.string().min(3).max(100),

    description: Joi.string().min(10),

    category: Joi.string().valid("motorcycle", "parts", "accessories"),

    price: Joi.number().min(0),

    images: Joi.array().items(
        Joi.object({
            url: Joi.string().uri(),
        })
    ),

    condition: Joi.string().valid("new", "used"),

    location: Joi.string(),

    status: Joi.string().valid("available", "sold", "archived"),
});