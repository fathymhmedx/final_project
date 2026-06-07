/** @type {import('mongoose').Model} */
const User = require("../users/users.model");
const ApiError = require("../../shared/errors/ApiError");
const { generateTokens, setRefreshCookie, verifyToken, clearRefreshCookie } = require("../../shared/utils/jwt.utils");
const jwt = require("jsonwebtoken");

const asyncHandler = require("express-async-handler");

/**
 * @route   POST /api/v1/auth/register
 * @desc    register a new user
 * @access  public
 */
exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token as cookie
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            accessToken,
        },
    });
});


/**
 * @route   POST /api/v1/auth/login
 * @desc    login a user
 * @access  public
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError('Incorrect email or password', 401);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new ApiError('Incorrect email or password', 401);
    }

    // Generate token 
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token as cookie
    setRefreshCookie(res, refreshToken);

    res.status(200).json({
        status: "success",
        message: "Login successful",
        accessToken,
    });
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    logout a user
 * @access  protected
 */
exports.logout = asyncHandler(async (req, res) => {
    clearRefreshCookie(res);

    res.status(200).json({
        status: "success",
        message: "Logout successful",
    });
});


/** 
 * @route  GET /api/v1/auth/refresh-token 
 * @desc   Issue new access token using refresh token cookie 
 * @access public
 */

exports.refreshToken = asyncHandler(async (req, res, next) => {

    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return next(new ApiError("Refresh token not provided", 401));
    }

    const payload = verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET_KEY
    );

    const user = await User.findById(payload.userId);

    if (!user) {
        return next(new ApiError("User no longer exists", 401));
    }

    const { accessToken } = generateTokens(user._id);

    res.status(200).json({
        status: "success",
        data: {
            accessToken,
        },
    });
});