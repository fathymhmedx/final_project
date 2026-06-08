const multer = require("multer");
const ApiError = require("../../shared/errors/ApiError");

// Store in memory
const storage = multer.memoryStorage();

// Filter only images
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new ApiError("Only image files are allowed", 400), false);
    }
};

const upload = multer({
    storage,
    fileFilter: imageFilter,
});

// Single image (user profile)
exports.uploadSingleImage = (fieldName) => upload.single(fieldName);

// Multiple fields (products)
exports.uploadFields = (fields) => upload.fields(fields);