const express = require("express");
const router = express.Router();
const validate = require("../../../shared/middlewares/validation/validate.middleware");
const { protect } = require("../../../shared/middlewares/auth.middleware");

const {
    createCommentSchema,
    updateCommentSchema,
    commentIdSchema,
    postIdParamSchema,
    getCommentsQuerySchema
} = require("./comments.validators");

const {
    addComment,
    getPostComments,
    replyToComment,
    getCommentReplies,
    updateComment,
    deleteComment,
    toggleLikeComment
} = require("./comments.controller");

router.use(protect);

// Routes related to a post's comments
router.post("/posts/:postId/comments", validate(postIdParamSchema, "params"), validate(createCommentSchema), addComment);
router.get("/posts/:postId/comments", validate(postIdParamSchema, "params"), validate(getCommentsQuerySchema, "query"), getPostComments);

// Routes related to specific comments
router.post("/comments/:id/reply", validate(commentIdSchema, "params"), validate(createCommentSchema), replyToComment);
router.get("/comments/:id/replies", validate(commentIdSchema, "params"), validate(getCommentsQuerySchema, "query"), getCommentReplies);
router.patch("/comments/:id", validate(commentIdSchema, "params"), validate(updateCommentSchema), updateComment);
router.delete("/comments/:id", validate(commentIdSchema, "params"), deleteComment);
router.post("/comments/:id/like", validate(commentIdSchema, "params"), toggleLikeComment);

module.exports = router;
