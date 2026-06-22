const { verifyToken } = require("../../../shared/utils/jwt.utils");
const User = require("../../users/users.model");
const Conversation = require("./conversation.model");
const Message = require("./message.model");

module.exports = (io) => {
    // Authentication middleware for Socket.IO
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
            
            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = verifyToken(token, process.env.JWT_SECRET_KEY);
            const user = await User.findById(decoded.userId).select("-password");

            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected to chat: ${socket.user._id}`);

        // Join personal room for user-specific notifications
        socket.join(`user_${socket.user._id}`);

        // Broadcast online status (optional feature)
        // socket.broadcast.emit("user_online", socket.user._id);

        socket.on("join_conversation", async (conversationId) => {
            // Verify user is part of conversation
            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: socket.user._id
            });

            if (conversation) {
                socket.join(conversationId);
                console.log(`User ${socket.user._id} joined conversation ${conversationId}`);
            }
        });

        socket.on("leave_conversation", (conversationId) => {
            socket.leave(conversationId);
        });

        socket.on("send_message", async (data) => {
            try {
                const { conversationId, content } = data;

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.user._id
                });

                if (!conversation) return;

                const message = await Message.create({
                    conversation: conversationId,
                    sender: socket.user._id,
                    content: content,
                    readBy: [socket.user._id]
                });

                await message.populate("sender", "name profileImage");

                // Update lastMessage
                conversation.lastMessage = {
                    content: content,
                    sender: socket.user._id,
                    timestamp: new Date()
                };
                await conversation.save();

                // Emit to all users in the conversation room
                io.to(conversationId).emit("new_message", message);

                // For users who are offline/not in the room, we could send notifications here
                // by iterating over participants and emitting to their personal rooms
                conversation.participants.forEach(participantId => {
                    if (participantId.toString() !== socket.user._id.toString()) {
                        io.to(`user_${participantId}`).emit("new_chat_notification", {
                            conversationId,
                            message: "New message received",
                            sender: { _id: socket.user._id, name: socket.user.name }
                        });
                    }
                });

            } catch (error) {
                console.error("Socket send_message error:", error);
            }
        });

        socket.on("typing", (data) => {
            const { conversationId, isTyping } = data;
            socket.to(conversationId).emit("user_typing", {
                conversationId,
                userId: socket.user._id,
                name: socket.user.name,
                isTyping
            });
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected from chat: ${socket.user._id}`);
            // socket.broadcast.emit("user_offline", socket.user._id);
        });
    });
};
