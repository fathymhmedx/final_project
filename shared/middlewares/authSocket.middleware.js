const { verifyToken } = require("../utils/jwt.utils");
const ApiError = require('../errors/ApiError');
const User = require("../../modules/users/users.model");

exports.protectSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new ApiError("Authentication required", 401)
        }

        const decoded = verifyToken(token, process.env.JWT_SECRET_KEY);

        const user = await User.findById(
            decoded.userId
        ).select(
            "_id name"
        );

        if (!user) {
            throw new ApiError("User not found", 404)
        }

        socket.user = user;

        next();
    }
    catch (err) {
        next(new Error(err.message));
    }
};