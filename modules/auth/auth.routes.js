const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout,
    refreshToken,
} = require("./auth.controller");
const validate = require("../../shared/middlewares/validation/validate.middleware");
const { protect, authorizeRoles } = require("../../shared/middlewares/auth.middleware");
const { registerSchema, loginSchema } = require("./auth.validators");

router
    .route("/register")
    .post(validate(registerSchema), register);

router
    .route("/login")
    .post(validate(loginSchema), login);

router
    .route("/logout")
    .post(protect, logout);

router
    .route("/refresh-token")
    .post(refreshToken);

module.exports = router;
