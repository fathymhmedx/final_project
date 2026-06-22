const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

exports.resizeUserImage = asyncHandler(async (req, res, next) => {
    if (!req.files && !req.file) return next();

    const uploadDir = path.join(__dirname, "../../uploads/users");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // Backward compatibility for single upload
    if (req.file) {
        const fileName = `user-${uuidv4()}-${Date.now()}.webp`;
        const filePath = path.join(uploadDir, fileName);

        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat("webp")
            .webp({ quality: 90 })
            .toFile(filePath);

        req.body.profileImage = fileName;
        return next();
    }

    if (req.files) {
        if (req.files.profileImage) {
            const file = req.files.profileImage[0];
            const fileName = `user-profile-${uuidv4()}-${Date.now()}.webp`;
            const filePath = path.join(uploadDir, fileName);

            await sharp(file.buffer)
                .resize(500, 500)
                .toFormat("webp")
                .webp({ quality: 90 })
                .toFile(filePath);

            req.body.profileImage = fileName;
        }

        if (req.files.coverImage) {
            const file = req.files.coverImage[0];
            const fileName = `user-cover-${uuidv4()}-${Date.now()}.webp`;
            const filePath = path.join(uploadDir, fileName);

            await sharp(file.buffer)
                .resize(1600, 500, { fit: "cover" }) // Suitable dimensions for a cover image
                .toFormat("webp")
                .webp({ quality: 90 })
                .toFile(filePath);

            req.body.coverImage = fileName;
        }
    }

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

exports.resizePostImages = asyncHandler(async (req, res, next) => {
    if (!req.files?.images) return next();

    const uploadDir = path.join(__dirname, "../../uploads/posts");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file) => {
            const fileName = `post-${uuidv4()}-${Date.now()}.webp`;
            const filePath = path.join(uploadDir, fileName);

            await sharp(file.buffer)
                .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
                .toFormat("webp")
                .webp({ quality: 90 })
                .toFile(filePath);

            req.body.images.push({ url: fileName });
        })
    );

    next();
});

exports.resizeChatImage = asyncHandler(async (req, res, next) => {
    if (!req.file) return next();

    const uploadDir = path.join(__dirname, "../../uploads/chat");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const fileName = `chat-${uuidv4()}-${Date.now()}.webp`;
    const filePath = path.join(uploadDir, fileName);

    await sharp(req.file.buffer)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .toFormat("webp")
        .webp({ quality: 90 })
        .toFile(filePath);

    req.body.image = fileName;

    next();
});