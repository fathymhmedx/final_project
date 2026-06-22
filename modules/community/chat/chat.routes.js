const express = require("express");
const router = express.Router();
const validate = require("../../../shared/middlewares/validation/validate.middleware");
const { protect } = require("../../../shared/middlewares/auth.middleware");
const { uploadSingleImage } = require("../../../shared/middlewares/uploadImage.middleware");
const { resizeChatImage } = require("../../../shared/middlewares/imageProcessing.middleware");

const {
    startConversationSchema,
    sendMessageSchema,
    conversationIdSchema,
    getMessagesQuerySchema
} = require("./chat.validators");

const {
    startConversation,
    getConversations,
    getConversation,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadMessageCount
} = require("./chat.controller");

router.use(protect);

router.get("/conversations", getConversations);
router.post("/conversations", validate(startConversationSchema), startConversation);
router.get("/unread-count", getUnreadMessageCount);

router.get("/conversations/:id", validate(conversationIdSchema, "params"), getConversation);
router.get("/conversations/:id/messages", validate(conversationIdSchema, "params"), validate(getMessagesQuerySchema, "query"), getMessages);

router.post("/conversations/:id/messages", 
    validate(conversationIdSchema, "params"), 
    uploadSingleImage("image"),
    resizeChatImage,
    validate(sendMessageSchema), 
    sendMessage
);

router.patch("/conversations/:id/read", validate(conversationIdSchema, "params"), markAsRead);

module.exports = router;
