const Joi = require("joi");

exports.updateMeSchema = Joi.object({
    name: Joi.string().trim().min(3).max(50),

    bio: Joi.string().trim().max(300),

    location: Joi.string().trim().max(100),

    bikeType: Joi.string().trim().max(50),

    profileImage: Joi.string().allow(""),
    
});
