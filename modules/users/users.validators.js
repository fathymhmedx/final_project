const Joi = require("joi");
const mongoose = require('mongoose')
// helper: validate mongo id
const objectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
    }
    return value;
};

// FOLLOW / UNFOLLOW PARAMS
exports.userIdParamSchema = Joi.object({
    id: Joi.string().required(),
});

exports.updateMeSchema = Joi.object({
    name: Joi.string().trim().min(3).max(50),

    bio: Joi.string().trim().max(300).allow(""),

    location: Joi.string().trim().max(100).allow(""),

    bikeType: Joi.string().trim().max(50).allow(""),

    profileImage: Joi.string().allow(""),

    coverImage: Joi.string().allow(""),

});
