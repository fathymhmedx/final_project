const Comment = require("./comments.model");
const Post = require("../posts/posts.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../../../shared/errors/ApiError");
const ApiFeatures = require("../../../shared/utils/apiFeatures");

/**
 * @desc Add Comment to Post
 * @route POST /api/v1/community/posts/:postId/comments
 * @access Protected
 */
exports.addComment = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId);

    if (!post || post.isDeleted) {
        return next(new ApiError("Post not found", 404));
    }

    const comment = await Comment.create({
        post: req.params.postId,
        author: req.user._id,
        content: req.body.content
    });

    // Increment post commentsCount
    post.commentsCount += 1;
    await post.save();

    res.status(201).json({
        status: "success",
        message: "Comment added successfully",
        data: {
            comment
        }
    });
});

/**
 * @desc Get Comments for a Post
 * @route GET /api/v1/community/posts/:postId/comments
 * @access Protected
 */
exports.getPostComments = asyncHandler(async (req, res, next) => {
    const features = new ApiFeatures(
        Comment.find({ 
            post: req.params.postId, 
            parentComment: null, // Only top-level comments
            isDeleted: false 
        }).populate("author", "name profileImage rank isVerified"),
        req.query
    ).sort();

    await features.paginate();
    const comments = await features.query;

    res.status(200).json({
        status: "success",
        pagination: features.paginationResult,
        results: comments.length,
        data: {
            comments
        }
    });
});

/**
 * @desc Reply to a Comment
 * @route POST /api/v1/community/comments/:id/reply
 * @access Protected
 */
exports.replyToComment = asyncHandler(async (req, res, next) => {
    const parentComment = await Comment.findById(req.params.id);

    if (!parentComment || parentComment.isDeleted) {
        return next(new ApiError("Parent comment not found", 404));
    }

    const post = await Post.findById(parentComment.post);
    if (!post || post.isDeleted) {
        return next(new ApiError("Associated post not found", 404));
    }

    const reply = await Comment.create({
        post: parentComment.post,
        author: req.user._id,
        content: req.body.content,
        parentComment: parentComment._id
    });

    post.commentsCount += 1;
    await post.save();

    res.status(201).json({
        status: "success",
        message: "Reply added successfully",
        data: {
            reply
        }
    });
});

/**
 * @desc Get Replies to a Comment
 * @route GET /api/v1/community/comments/:id/replies
 * @access Protected
 */
exports.getCommentReplies = asyncHandler(async (req, res, next) => {
    const features = new ApiFeatures(
        Comment.find({ 
            parentComment: req.params.id, 
            isDeleted: false 
        }).populate("author", "name profileImage rank isVerified"),
        req.query
    ).sort();

    await features.paginate();
    const replies = await features.query;

    res.status(200).json({
        status: "success",
        pagination: features.paginationResult,
        results: replies.length,
        data: {
            replies
        }
    });
});

/**
 * @desc Update Comment
 * @route PATCH /api/v1/community/comments/:id
 * @access Private (Owner only)
 */
exports.updateComment = asyncHandler(async (req, res, next) => {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
        return next(new ApiError("Comment not found", 404));
    }

    if (comment.author.toString() !== req.user._id.toString()) {
        return next(new ApiError("You are not authorized to update this comment", 403));
    }

    comment.content = req.body.content;
    await comment.save();

    res.status(200).json({
        status: "success",
        message: "Comment updated successfully",
        data: {
            comment
        }
    });
});

/**
 * @desc Soft Delete Comment
 * @route DELETE /api/v1/community/comments/:id
 * @access Private (Owner or Admin)
 */
exports.deleteComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        return next(new ApiError("Comment not found", 404));
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ApiError("You are not authorized to delete this comment", 403));
    }

    comment.isDeleted = true;
    await comment.save();

    // Decrement post comment count
    const post = await Post.findById(comment.post);
    if (post && post.commentsCount > 0) {
        post.commentsCount -= 1;
        await post.save();
    }

    res.status(200).json({
        status: "success",
        message: "Comment deleted successfully"
    });
});

/**
 * @desc Toggle Like on Comment
 * @route POST /api/v1/community/comments/:id/like
 * @access Protected
 */
exports.toggleLikeComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.isDeleted) {
        return next(new ApiError("Comment not found", 404));
    }

    const isLiked = comment.likes.includes(req.user._id);

    if (isLiked) {
        comment.likes.pull(req.user._id);
        comment.likesCount -= 1;
    } else {
        comment.likes.push(req.user._id);
        comment.likesCount += 1;
    }

    await comment.save();

    res.status(200).json({
        status: "success",
        message: isLiked ? "Comment unliked" : "Comment liked",
        data: {
            likesCount: comment.likesCount,
            isLiked: !isLiked
        }
    });
});
