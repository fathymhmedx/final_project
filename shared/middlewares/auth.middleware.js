const asyncHandler = require("express-async-handler");
const User = require("../../modules/users/users.model");
const ApiError = require("../../shared/errors/ApiError");
const { verifyToken } = require("../utils/jwt.utils");

/**
 * @desc Protect routes by verifying JWT
 */
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Get token from header
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError(
        "You are not logged in. Please login to access this route",
        401
      )
    );
  }

  // 2) Verify token
  const decoded = verifyToken(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(new ApiError("User no longer exists", 401));
  }

  // 4) Attach user to request
  req.user = currentUser;

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Unauthorized", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          "You do not have permission to perform this action",
          403
        )
      );
    }

    next();
  };
};