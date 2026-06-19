const express = require("express");
const router = express.Router();
const {
    getMe,
    updateMe,
    getUserById,
    getAllUsers,
    toggleBlockUser,
    followUser,
    unfollowUser,
    getUserFollowers,
    getUserFollowing,
    toggleUserVerification,
    getTopRiders
} = require("./users.controller");
const { protect, authorizeRoles } = require("../../shared/middlewares/auth.middleware");
const validate = require("../../shared/middlewares/validation/validate.middleware");
const { updateMeSchema, userIdParamSchema } = require("./users.validators");

const {
    uploadSingleImage,
} = require("../../shared/middlewares/uploadImage.middleware");

const {
    resizeUserImage,
} = require("../../shared/middlewares/imageProcessing.middleware");

router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.get("/me", protect, getMe);
router.patch("/me", protect, uploadSingleImage("profileImage"), resizeUserImage, validate(updateMeSchema), updateMe);
router.get("/top-riders", getTopRiders);
router.get("/:id", getUserById);
router.patch("/:id/toggle-block", protect, authorizeRoles("admin"), toggleBlockUser);

// FOLLOW / UNFOLLOW
router.patch("/:id/follow", protect, validate(userIdParamSchema, 'params'), followUser);
router.patch("/:id/unfollow", protect, validate(userIdParamSchema, 'params'), unfollowUser);

// FOLLOWERS / FOLLOWING
router.get("/:id/followers", getUserFollowers);
router.get("/:id/following", getUserFollowing);

router.patch(
    "/:id/verify",
    protect,
    authorizeRoles("admin"),
    toggleUserVerification
);

module.exports = router;