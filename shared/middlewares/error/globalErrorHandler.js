const ApiError = require("../../errors/ApiError");

const {
    handleCastErrorDB,
    handleDuplicateFieldsDB,
    handleValidationErrorDB,
    handleJwtInvalidSignature,
    handleJwtExpired,
} = require("./errorHelpers");

// DEV ERROR
const sendErrorDev = (err, res) => {
    return res.status(err.statusCode || 500).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

// PROD ERROR
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            errors: err.errors || undefined,
        });
    }

    console.error("ERROR:", err);

    return res.status(500).json({
        status: "error",
        message: "Something went wrong!",
    });
};

// GLOBAL ERROR HANDLER
exports.globalErrorHandler = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        return sendErrorDev(err, res);
    }

    let error = err;

    // MongoDB Errors
    if (
        error.code === 11000 ||
        error.cause?.code === 11000 ||
        error.errorResponse?.code === 11000
    ) {
        error = handleDuplicateFieldsDB(error);
    }

    if (error.name === "CastError") {
        error = handleCastErrorDB(error);
    }

    if (error.name === "ValidationError") {
        error = handleValidationErrorDB(error);
    }

    // JWT Errors
    if (error.name === "JsonWebTokenError") {
        error = handleJwtInvalidSignature();
    }

    if (error.name === "TokenExpiredError") {
        error = handleJwtExpired();
    }

    return sendErrorProd(error, res);
};

exports.notFoundHandler = (req, res, next) => {
    next(new ApiError(`Can't find ${req.originalUrl}`, 404));
};