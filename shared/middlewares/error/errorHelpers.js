const ApiError = require("../../errors/ApiError");

// Cast Error (Invalid ObjectId)
exports.handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value || "value"}`;
    return new ApiError(message, 400);
};

// Duplicate Key Error
exports.handleDuplicateFieldsDB = (err) => {
    const keyValue =
        err.keyValue ||
        err.cause?.keyValue ||
        err.errorResponse?.keyValue ||
        {};

    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];

    const message = `Duplicate field "${field}": "${value}"`;

    return new ApiError(message, 409);
};

// Validation Error (Mongoose)
exports.handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => ({
        field: el.path,
        message: el.message,
    }));

    const error = new ApiError("Validation error", 400);
    error.errors = errors;

    return error;
};

// JWT Invalid
exports.handleJwtInvalidSignature = () =>
    new ApiError("Invalid token, please login again", 401);

// JWT Expired
exports.handleJwtExpired = () =>
    new ApiError("Token expired, please login again", 401);
