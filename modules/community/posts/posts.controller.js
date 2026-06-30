const Post = require("./posts.model");
const User = require("../../users/users.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../../../shared/errors/ApiError");
const ApiFeatures = require("../../../shared/utils/apiFeatures");

/**
 * @desc Create Post
 * @route POST /api/v1/community/posts
 * @access Private
 */
exports.createPost = asyncHandler(async (req, res, next) => {
    const { content, images } = req.body;

    const hasContent =
        (content && content.trim() !== "") ||
        (images && images.length > 0);

    if (!hasContent) {
        return next(
            new ApiError("Post must contain content or images", 400)
        );
    }

    const post = await Post.create({
        content,
        images,
        author: req.user._id
    });

    res.status(201).json({
        status: "success",
        message: "Post created successfully",
        data: { post }
    });
});

/**
 * @desc Get Feed (All Posts)
 * @route GET /api/v1/community/posts
 * @access Protected
 */
exports.getPosts = asyncHandler(async (req, res) => {
    let filter = { isDeleted: false };

    // Hashtag filter — remove from req.query so ApiFeatures.filter() won't touch it
    if (req.query.hashtag) {
        const cleanTag = req.query.hashtag.replace(/^#/, '').toLowerCase();
        filter.$or = [
            { hashtags: cleanTag },
            { content: { $regex: new RegExp(`#${cleanTag}\\b`, 'i') } }
        ];
        delete req.query.hashtag;
    }

    // Author filter — also handle before passing to ApiFeatures
    if (req.query.author) {
        filter.author = req.query.author;
        delete req.query.author;
    }

    // Following filter
    if (req.query.following === 'true') {
        if (!req.user) {
            return next(new ApiError("You must be logged in to view followed posts", 401));
        }
        const currentUser = await User.findById(req.user._id).select('following');
        filter.author = { $in: [...currentUser.following] }; // Only posts from followed users, NOT own posts
        delete req.query.following;
    }

    const baseQuery = Post.find(filter)
        .populate("author", "name profileImage rank isVerified")
        .populate("likes", "name profileImage");

    // Only use search() and sort() from ApiFeatures — NOT filter() since we already built our filter above
    const features = new ApiFeatures(baseQuery, req.query)
        .search()
        .sort();

    await features.paginate();

    const posts = await features.query;

    res.status(200).json({
        status: "success",
        pagination: features.paginationResult,
        results: posts.length,
        data: {
            posts
        }
    });
});

/**
 * @desc Get Single Post
 * @route GET /api/v1/community/posts/:id
 * @access Protected
 */
exports.getPost = asyncHandler(async (req, res, next) => {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
        .populate("author", "name profileImage rank isVerified")
        .populate("likes", "name profileImage");

    if (!post) {
        return next(new ApiError("Post not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            post
        }
    });
});

/**
 * @desc Update Post
 * @route PATCH /api/v1/community/posts/:id
 * @access Private (Owner only)
 */
exports.updatePost = asyncHandler(async (req, res, next) => {

    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ApiError("Post not found", 404));
    }

    if (post.author.toString() !== req.user._id.toString()) {
        return next(new ApiError("Not authorized", 403));
    }

    if (req.body.content !== undefined) {
        post.content = req.body.content;
    }

    if (req.body.images !== undefined) {
        post.images = req.body.images;
    }

    await post.save();

    res.status(200).json({
        status: "success",
        message: "Post updated successfully",
        data: { post }
    });
});

/**
 * @desc Soft Delete Post
 * @route DELETE /api/v1/community/posts/:id
 * @access Private (Owner or Admin)
 */
exports.deletePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new ApiError("Post not found", 404));
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ApiError("You are not authorized to delete this post", 403));
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    res.status(200).json({
        status: "success",
        message: "Post deleted successfully"
    });
});

/**
 * @desc Toggle Like on Post
 * @route POST /api/v1/community/posts/:id/like
 * @access Protected
 */
exports.toggleLikePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
        return next(new ApiError("Post not found", 404));
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
        // Unlike
        post.likes.pull(req.user._id);
        post.likesCount -= 1;
    } else {
        // Like
        post.likes.push(req.user._id);
        post.likesCount += 1;
        // TODO: Send Notification to post.author (if not liking own post)
    }

    await post.save();

    res.status(200).json({
        status: "success",
        message: isLiked ? "Post unliked" : "Post liked",
        data: {
            likesCount: post.likesCount,
            isLiked: !isLiked
        }
    });
});

/**
 * @desc Toggle Bookmark Post
 * @route POST /api/v1/community/posts/:id/bookmark
 * @access Protected
 */
exports.toggleBookmarkPost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
        return next(new ApiError("Post not found", 404));
    }

    const userId = req.user._id.toString();

    const isBookmarked = post.bookmarks.some(
        (id) => id.toString() === userId
    );

    if (isBookmarked) {
        post.bookmarks.pull(req.user._id);
    } else {
        post.bookmarks.addToSet(req.user._id);
    }

    await post.save();

    res.status(200).json({
        status: "success",
        message: isBookmarked ? "Bookmark removed" : "Post bookmarked",
        data: {
            isBookmarked: !isBookmarked
        }
    });
});


/**
 * @desc Get My Bookmarked Posts
 * @route GET /api/v1/community/posts/my/bookmarks
 * @access Protected
 */
exports.getMyBookmarks = asyncHandler(async (req, res) => {

    const posts = await Post.find({
        bookmarks: req.user._id,
        isDeleted: false
    })
        .populate("author", "name profileImage rank isVerified")
        .sort("-createdAt");

    res.status(200).json({
        status: "success",
        results: posts.length,
        data: {
            posts
        }
    });
});

/**
 * @desc Get My Posts
 * @route GET /api/v1/community/posts/my/posts
 * @access Protected
 */
exports.getMyPosts = asyncHandler(async (req, res) => {
    const features = new ApiFeatures(
        Post.find({ author: req.user._id, isDeleted: false })
            .populate("author", "name profileImage rank isVerified"),
        req.query
    ).sort()
    
    await features.paginate();

    const posts = await features.query;

    res.status(200).json({
        status: "success",
        pagination: features.paginationResult,
        results: posts.length,
        data: {
            posts
        }
    });
});

/**
 * @desc Get Posts by User ID
 * @route GET /api/v1/community/posts/user/:userId
 * @access Protected
 */
exports.getUserPosts = asyncHandler(async (req, res) => {
    const features = new ApiFeatures(
        Post.find({ author: req.params.userId, isDeleted: false })
            .populate("author", "name profileImage rank isVerified"),
        req.query
    ).sort();

    await features.paginate();
    const posts = await features.query;

    res.status(200).json({
        status: "success",
        pagination: features.paginationResult,
        results: posts.length,
        data: {
            posts
        }
    });
});

/**
 * @desc Get Trending Hashtags
 * @route GET /api/v1/community/trending/hashtags
 * @access Protected
 */
exports.getTrendingHashtags = asyncHandler(async (req, res) => {
    // Get hashtags from posts in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingTags = await Post.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: sevenDaysAgo }, hashtags: { $exists: true, $ne: [] } } },
        { $unwind: "$hashtags" },
        { $group: { _id: "$hashtags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    res.status(200).json({
        status: "success",
        data: {
            hashtags: trendingTags.map(t => ({ tag: t._id, count: t.count }))
        }
    });
});

/**
 * @desc Get Trending Posts
 * @route GET /api/v1/community/trending/posts
 * @access Protected
 */
exports.getTrendingPosts = asyncHandler(async (req, res) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingPosts = await Post.find({
        isDeleted: false,
        createdAt: { $gte: sevenDaysAgo }
    })
        .sort({ likesCount: -1, commentsCount: -1 })
        .limit(5)
        .populate("author", "name profileImage rank isVerified");

    res.status(200).json({
        status: "success",
        data: {
            posts: trendingPosts
        }
    });
});
