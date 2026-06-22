const express = require("express");
const router = express.Router();
const validate = require("../../../shared/middlewares/validation/validate.middleware");
const { protect } = require("../../../shared/middlewares/auth.middleware");
const { uploadFields } = require("../../../shared/middlewares/uploadImage.middleware");
const { resizePostImages } = require("../../../shared/middlewares/imageProcessing.middleware");

const {
    createPostSchema,
    updatePostSchema,
    postIdSchema,
    userIdSchema,
    getPostsQuerySchema
} = require("./posts.validators");

const {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    toggleLikePost,
    toggleBookmarkPost,
    getMyBookmarks,
    getMyPosts,
    getUserPosts,
    getTrendingHashtags,
    getTrendingPosts
} = require("./posts.controller");

// All routes are protected
router.use(protect);

router.post("/", 
    uploadFields([
        { name: "images", maxCount: 5 }
    ]),
    resizePostImages,
    validate(createPostSchema), 
    createPost
);

router.get("/", validate(getPostsQuerySchema, "query"), getPosts);
router.get("/my/bookmarks", getMyBookmarks);
router.get("/my/posts", getMyPosts);
router.get("/trending/hashtags", getTrendingHashtags);
router.get("/trending/posts", getTrendingPosts);
router.get("/user/:userId", validate(userIdSchema, "params"), getUserPosts); 

router.get("/:id", validate(postIdSchema, "params"), getPost);
router.patch("/:id", validate(postIdSchema, "params"), validate(updatePostSchema), updatePost);
router.delete("/:id", validate(postIdSchema, "params"), deletePost);

router.post("/:id/like", validate(postIdSchema, "params"), toggleLikePost);
router.post("/:id/bookmark", validate(postIdSchema, "params"), toggleBookmarkPost);

module.exports = router;
