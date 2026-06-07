/** @type {import('mongoose').Model} */
const User = require("./users.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../../shared/errors/ApiError");

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
});

/**
 * @desc    Update user profile (profile setup)
 * @route   PATCH /api/v1/users/me
 * @access  Private
 */
exports.updateMe = asyncHandler(async (req, res, next) => {
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        throw new ApiError("No valid fields to update", 400);
    }

    if (updates.bio || updates.location || updates.bikeType || updates.profileImage) {
        updates.profileCompleted = true;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    if (!updatedUser) {
        throw new ApiError("User not found", 404);
    }

    res.status(200).json({
        status: "success",
        message: "Profile updated successfully",
        data: {
            user: updatedUser,
        },
    });
});

/**
 * @desc    Get user by id (public profile)
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
exports.getUserById = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select(
        "name bio location bikeType profileImage createdAt"
    );

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
});

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password");

    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users,
        },
    });
});

/**
 * @desc    Toggle user block status
 * @route   PATCH /api/v1/users/:id/toggle-block
 * @access  Admin
 */
exports.toggleBlockUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ApiError("User not found", 404));
    }

    // toggle value
    user.isBlocked = !user.isBlocked;

    await user.save();

    res.status(200).json({
        status: "success",
        message: `User is now ${user.isBlocked ? "blocked" : "active"}`,
        data: {
            isBlocked: user.isBlocked,
        },
    });
});