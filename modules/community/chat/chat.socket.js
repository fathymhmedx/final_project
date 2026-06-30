const { protectSocket } = require("../../../shared/middlewares/authSocket.middleware");
const Conversation = require("./conversation.model");
const Message = require("./message.model");

module.exports = (io) => {
    // Socket Authentication
    io.use(
        protectSocket
    );

    io.on("connection", (socket) => {
        console.log(`User connected to chat: ${socket.user._id}`);

        // Join personal room for user-specific notifications
        socket.join(`user_${socket.user._id}`);

        // Broadcast online status (optional feature)
        // socket.broadcast.emit("user_online", socket.user._id);

        socket.on("join_conversation", async (conversationId) => {
            try {
                // Verify user is part of conversation
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.user._id
                });

                if (!conversation) {
                    return socket.emit(
                        "chat_error",
                        {
                            message:
                                "Conversation not found"
                        }
                    );
                }
                socket.join(conversationId);

                console.log(
                    `User ${socket.user._id} joined conversation ${conversationId}`
                );

                socket.emit(
                    "conversation_joined",
                    {
                        conversationId
                    }
                );

            } catch (err) {
                socket.emit("chat_error", {
                    message: "Failed to join"
                });
            }

        });

        socket.on("leave_conversation", (conversationId) => {
            socket.leave(conversationId);

            socket.emit("conversation_left", {
                conversationId
            });
        });

        socket.on("send_message", async (data) => {
            try {
                const { conversationId, content } = data;
                if (
                    !conversationId ||
                    (!content?.trim())
                ) {
                    return;
                }

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.user._id
                });

                if (!conversation) {
                    return socket.emit(
                        "chat_error",
                        {
                            message:
                                "Conversation not found"
                        }
                    );
                }

                const message = await Message.create({
                    conversation: conversationId,
                    sender: socket.user._id,
                    content: content.trim(),
                    readBy: [socket.user._id]
                });

                await message.populate("sender", "name profileImage");

                await Conversation.updateOne(
                    {
                        _id: conversationId
                    },
                    {
                        $set: {
                            lastMessage: {
                                content: content.trim(),
                                sender: socket.user._id,
                                timestamp: new Date()
                            }
                        }
                    }
                );

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

        socket.on("typing", async (data) => {
            try {
                const { conversationId, isTyping } = data;

                const exists =
                    await Conversation.exists({
                        _id: conversationId,
                        participants:
                            socket.user._id
                    });

                if (!exists) return;

                socket
                    .to(conversationId)
                    .emit(
                        "user_typing",
                        {
                            conversationId,
                            userId:
                                socket.user._id,
                            name:
                                socket.user.name,
                            isTyping
                        }
                    );
            } catch {
                socket.emit(
                    "chat_error",
                    {
                        message:
                            "Typing failed"
                    }
                );
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected from chat: ${socket.user._id}`);
            // socket.broadcast.emit("user_offline", socket.user._id);
        });
    });
};
