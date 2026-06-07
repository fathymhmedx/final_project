const Joi = require("joi");

// Password must be at least 8 characters, include uppercase, lowercase, number, and special character
const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

exports.registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.base": "Name must be a string",
            "string.min": "Name must be at least 3 characters",
            "string.max": "Name must be less than 50 characters",
            "any.required": "Name is required",
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Invalid email format",
            "any.required": "Email is required",
        }),

    password: Joi.string()
        .pattern(passwordRegex)
        .required()
        .messages({
            "string.pattern.base":
                "Password must be at least 8 chars and include uppercase, lowercase, number, and special character",
            "any.required": "Password is required",
        }),

    role: Joi.string()
        .valid("user", "admin")
        .default("user"),
});

exports.loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Invalid email format",
            "any.required": "Email is required",
        }),

    password: Joi.string()
        .required()
        .messages({
            "any.required": "Password is required",
        }),
});