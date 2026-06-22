const Conversation = require("./conversation.model");
const Message = require("./message.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../../../shared/errors/ApiError");
const ApiFeatures = require("../../../shared/utils/apiFeatures");

/**
 * @desc Start Direct Conversation
 * @route POST /api/v1/community/chat/conversations
 * @access Protected
 */
exports.startConversation = asyncHandler(async (req, res, next) => {
    const { participantId, relatedProduct } = req.body;

    if (participantId === req.user._id.toString()) {
        return next(new ApiError("Cannot start conversation with yourself", 400));
    }

    // Check if direct conversation already exists
    let query = {
        type: "direct",
        participants: { $all: [req.user._id, participantId] }
    };

    if (relatedProduct) {
        query.relatedProduct = relatedProduct;
    }

    let conversation = await Conversation.findOne(query);

    if (conversation) {
        return res.status(200).json({
            status: "success",
            message: "Conversation exists",
            data: { conversation }
        });
    }

    // Create new conversation
    conversation = await Conversation.create({
        type: "direct",
        participants: [req.user._id, participantId],
        relatedProduct: relatedProduct || null
    });

    res.status(201).json({
        status: "success",
        message: "Conversation started",
        data: { conversation }
    });
});

/**
 * @desc Get My Conversations
 * @route GET /api/v1/community/chat/conversations
 * @access Protected
 */
exports.getConversations = asyncHandler(async (req, res) => {
    const features = new ApiFeatures(
        Conversation.find({ participants: req.user._id, isActive: true })
            .populate("participants", "name profileImage rank")
            .populate("relatedProduct", "title images price")
            .populate("relatedEvent", "title coverImage startDate"),
        req.query
    ).paginate();

    // Sort by lastMessage.timestamp descending
    features.query = features.query.sort({ "lastMessage.timestamp": -1, "updatedAt": -1 });

    await features;
    const conversations = await features.query;

    res.status(200).json({
        status: "success",
        pagination: features.paginationResult,
        results: conversations.length,
        data: { conversations }
    });
});

/**
 * @desc Get Conversation Details
 * @route GET /api/v1/community/chat/conversations/:id
 * @access Protected
 */
exports.getConversation = asyncHandler(async (req, res, next) => {
    const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.user._id
    })
    .populate("participants", "name profileImage rank isVerified")
    .populate("relatedProduct", "title images price")
    .populate("relatedEvent", "title coverImage startDate");

    if (!conversation) {
        return next(new ApiError("Conversation not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { conversation }
    });
});

/**
 * @desc Get Messages
 * @route GET /api/v1/community/chat/conversations/:id/messages
 * @access Protected
 */
exports.getMessages = asyncHandler(async (req, res, next) => {
    // Check if participant
    const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.user._id
    });

    if (!conversation) {
        return next(new ApiError("Conversation not found", 404));
    }

    const features = new ApiFeatures(
        Message.find({ conversation: req.params.id, isDeleted: false })
            .populate("sender", "name profileImage"),
        req.query
    ).paginate();

    // Messages should be ordered oldest first for chat view, but usually we fetch newest first and reverse on frontend.
    // Let's sort newest first to get the latest page, then frontend reverses.
    features.query = features.query.sort("-createdAt");

    await features;
    const messages = await features.query;

    res.status(200).json({
        status: "success",
        pagination: features.paginationResult,
        results: messages.length,
        data: { messages }
    });
});

/**
 * @desc Send Message (REST fallback)
 * @route POST /api/v1/community/chat/conversations/:id/messages
 * @access Protected
 */
exports.sendMessage = asyncHandler(async (req, res, next) => {
    const { content } = req.body;
    const image = req.body.image; // Assume middleware sets this

    if (!content && !image) {
        return next(new ApiError("Message must contain text or image", 400));
    }

    const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.user._id
    });

    if (!conversation) {
        return next(new ApiError("Conversation not found", 404));
    }

    const message = await Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        content,
        image: image ? { url: image } : undefined,
        readBy: [req.user._id]
    });

    // Update conversation lastMessage
    conversation.lastMessage = {
        content: content || "Image",
        sender: req.user._id,
        timestamp: new Date()
    };
    await conversation.save();

    res.status(201).json({
        status: "success",
        data: { message }
    });
});

/**
 * @desc Mark Conversation as Read
 * @route PATCH /api/v1/community/chat/conversations/:id/read
 * @access Protected
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
    const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.user._id
    });

    if (!conversation) {
        return next(new ApiError("Conversation not found", 404));
    }

    await Message.updateMany(
        { conversation: conversation._id, readBy: { $ne: req.user._id } },
        { $push: { readBy: req.user._id } }
    );

    res.status(200).json({
        status: "success",
        message: "Messages marked as read"
    });
});

/**
 * @desc Get Unread Messages Count
 * @route GET /api/v1/community/chat/unread-count
 * @access Protected
 */
exports.getUnreadMessageCount = asyncHandler(async (req, res) => {
    // Find all conversations where user is a participant
    const conversations = await Conversation.find({ participants: req.user._id }).select('_id');
    const conversationIds = conversations.map(c => c._id);

    // Count messages in these conversations where user is not in readBy
    const count = await Message.countDocuments({
        conversation: { $in: conversationIds },
        readBy: { $ne: req.user._id }
    });

    res.status(200).json({
        status: "success",
        data: { count }
    });
});
