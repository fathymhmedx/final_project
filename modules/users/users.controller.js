/** @type {import('mongoose').Model} */
const User = require("./users.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../../shared/errors/ApiError");
const ApiFeatures = require("../../shared/utils/apiFeatures");

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

    if (updates.bio || updates.location || updates.bikeType || updates.profileImage || updates.coverImage) {
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
        "name bio location bikeType profileImage coverImage createdAt rank isVerified followersCount followingCount"
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

const updateUserRank = async (userId) => {
    const user = await User.findById(userId);

    if (!user) return;

    const followersCount = user.followers.length;

    let newRank = "New Rider";

    if (followersCount >= 50) {
        newRank = "Elite Member";
    } else if (followersCount >= 5) {
        newRank = "Active Rider";
    }

    // Admin always keeps special label
    if (user.role === "admin") {
        newRank = "Administrator";
    }

    user.rank = newRank;

    await user.save();
};


exports.followUser = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if (currentUserId.equals(targetUserId)) {
        throw new ApiError("You cannot follow yourself", 400);
    }

    const targetUserExists = await User.exists({ _id: targetUserId });

    if (!targetUserExists) {
        throw new ApiError("User not found", 404);
    }

    // Prevent duplicate follow (idempotent)
    const alreadyFollowing = await User.exists({
        _id: currentUserId,
        following: targetUserId,
    });

    if (alreadyFollowing) {
        return res.status(200).json({
            status: "success",
            message: "Already following this user",
        });
    }

    await Promise.all([
        User.findByIdAndUpdate(currentUserId, {
            $addToSet: { following: targetUserId },
            $inc: { followingCount: 1 },
        }),

        User.findByIdAndUpdate(targetUserId, {
            $addToSet: { followers: currentUserId },
            $inc: { followersCount: 1 },
        }),
    ]);
    await updateUserRank(targetUserId);

    res.status(200).json({
        status: "success",
        message: "Followed successfully",
    });
});

exports.unfollowUser = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if (currentUserId.equals(targetUserId)) {
        throw new ApiError("You cannot unfollow yourself", 400);
    }

    const targetUserExists = await User.exists({ _id: targetUserId });

    if (!targetUserExists) {
        throw new ApiError("User not found", 404);
    }

    const isFollowing = await User.exists({
        _id: currentUserId,
        following: targetUserId,
    });

    if (!isFollowing) {
        return res.status(200).json({
            status: "success",
            message: "You are not following this user",
        });
    }

    await Promise.all([
        User.findByIdAndUpdate(currentUserId, {
            $pull: { following: targetUserId },
            $inc: { followingCount: -1 },
        }),

        User.findByIdAndUpdate(targetUserId, {
            $pull: { followers: currentUserId },
            $inc: { followersCount: -1 },
        }),
    ]);

    await updateUserRank(targetUserId);

    res.status(200).json({
        status: "success",
        message: "Unfollowed successfully",
    });
});

exports.getUserFollowers = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    // Base query: users who are in followers array
    const baseQuery = User.find({
        _id: { $in: user.followers },
    });

    const apiFeatures = new ApiFeatures(baseQuery, req.query)
        .filter()
        .search()

    await apiFeatures.paginate();

    const followers = await apiFeatures.query;

    res.status(200).json({
        status: "success",
        results: followers.length,
        pagination: apiFeatures.paginationResult,
        data: {
            followers,
        },
    });
});


exports.getUserFollowing = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    const baseQuery = User.find({
        _id: { $in: user.following },
    });

    const apiFeatures = new ApiFeatures(baseQuery, req.query)
        .filter()
        .search()

    await apiFeatures.paginate();

    const following = await apiFeatures.query;

    res.status(200).json({
        status: "success",
        results: following.length,
        pagination: apiFeatures.paginationResult,
        data: {
            following,
        },
    });
});


exports.toggleUserVerification = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ApiError("User not found", 404));
    }

    // toggle verification
    user.isVerified = !user.isVerified;

    await user.save();

    res.status(200).json({
        status: "success",
        message: `User is now ${user.isVerified ? "verified" : "unverified"}`,
        data: {
            user: {
                id: user._id,
                name: user.name,
                isVerified: user.isVerified,
            },
        },
    });
});

/**
 * @desc    Get top riders based on followers
 * @route   GET /api/v1/users/top-riders
 * @access  Public
 */
exports.getTopRiders = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    
    const users = await User.find({ isBlocked: false, role: { $ne: "admin" } })
        .sort({ followersCount: -1 })
        .limit(limit)
        .select("name rank followersCount profileImage coverImage isVerified bio bikeType");

    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users,
        },
    });
});