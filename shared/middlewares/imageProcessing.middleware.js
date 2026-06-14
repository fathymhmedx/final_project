const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

exports.resizeUserImage = asyncHandler(async (req, res, next) => {
    if (!req.file) return next();

    const uploadDir = path.join(__dirname, "../../uploads/users");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const fileName = `user-${uuidv4()}-${Date.now()}.webp`;
    const filePath = path.join(uploadDir, fileName);

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat("webp")
        .webp({ quality: 90 })
        .toFile(filePath);

    req.body.profileImage = fileName;

    next();
});

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
    const uploadDir = path.join(__dirname, "../../uploads/products");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // Cover image
    if (req.files?.imageCover) {
        const fileName = `cover-${uuidv4()}-${Date.now()}.webp`;
        const filePath = path.join(uploadDir, fileName);

        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat("webp")
            .webp({ quality: 95 })
            .toFile(filePath);

        req.body.imageCover = fileName;
    }

    // Gallery images
    if (req.files?.images) {
        req.body.images = [];

        await Promise.all(
            req.files.images.map(async (file) => {
                const fileName = `product-${uuidv4()}-${Date.now()}.webp`;
                const filePath = path.join(uploadDir, fileName);

                await sharp(file.buffer)
                    .resize(800, 800)
                    .toFormat("webp")
                    .webp({ quality: 90 })
                    .toFile(filePath);

                req.body.images.push({
                    url: fileName,
                });
            })
        );
    }

    next();
});

exports.resizeRideEventImage = asyncHandler(async (req, res, next) => {

    if (!req.files?.coverImage) return next();

    const file = req.files.coverImage[0];

    const uploadDir = path.join(
        __dirname,
        "../../uploads/ride-events"
    );

    await fs.promises.mkdir(uploadDir, { recursive: true });

    const fileName = `ride-event-${uuidv4()}-${Date.now()}.webp`;

    const filePath = path.join(uploadDir, fileName);

    await sharp(file.buffer)
        .resize(1600, 900)
        .toFormat("webp")
        .webp({ quality: 90 })
        .toFile(filePath);

    req.body.coverImage = fileName;

    next();
});