const express = require("express");
const router = express.Router();
const { getMe, updateMe, getUserById, getAllUsers, toggleBlockUser } = require("./users.controller");
const { protect, authorizeRoles } = require("../../shared/middlewares/auth.middleware");
const validate = require("../../shared/middlewares/validation/validate.middleware");
const { updateMeSchema } = require("./users.validators");

const {
    uploadSingleImage,
} = require("../../shared/middlewares/uploadImage.middleware");

const {
    resizeUserImage,
} = require("../../shared/middlewares/imageProcessing.middleware");

router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.get("/me", protect, getMe);
router.patch("/me", protect, uploadSingleImage("profileImage"), resizeUserImage, validate(updateMeSchema), updateMe);
router.get("/:id", getUserById);
router.patch("/:id/toggle-block", protect, authorizeRoles("admin"), toggleBlockUser);



module.exports = router;