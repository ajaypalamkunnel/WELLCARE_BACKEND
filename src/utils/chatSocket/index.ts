import { Server as SocketIOServer, Socket } from "socket.io";
import { Types } from "mongoose";
import MessageRepository from "../../repositories/implementation/chat/MessageRepository";
import ChatService from "../../services/implementation/chat/messageService";
import { sendNotificationToUser } from "../notification/sendNotification";
import { registerWebRTCSocketHandlers } from "../socket/webrtcSocket";
import { registerNotificationSocketHandlers } from "../notification/notificationSocket";

const messageRepo = new MessageRepository();
const chatService = new ChatService(messageRepo);
export const onlineUsers = new Map<string, Set<string>>();

export const initializeSocketServer = (io: SocketIOServer) => {
    io.on("connection", (socket: Socket) => {
        console.log("User connected:", socket.id);
        console.log("Cookies:", socket.handshake.headers.cookie);

        socket.on("error", (err) => {
            console.error("Socket error:", err);
        });

        socket.on("user-online", ({ userId }) => {
            if (!userId) return;

            const existingSockets = onlineUsers.get(userId) || new Set();
            existingSockets.add(socket.id);
            onlineUsers.set(userId, existingSockets);

            console.log(`✅ ${userId} is online via ${socket.id}`);
        });

        socket.on(
            "send-message",
            async (
                {
                    to,
                    message,
                    type = "text",
                    from,
                    fromRole,
                    toRole,
                    mediaUrl,
                    mediaType,
                },
                callback
            ) => {
                try {
                    let role: "Doctor" | "user" = toRole === "User" ? "user" : "Doctor";

                    if (!to || !from) {
                        return callback({
                            success: false,
                            message: "Invalid message payload",
                        });
                    }

                    if (!message?.trim() && !mediaUrl?.trim()) {
                        return callback({
                            success: false,
                            message: "Message must contain text or media",
                        });
                    }

                    const savedMessage = await chatService.sendMessage(
                        new Types.ObjectId(from),
                        new Types.ObjectId(to),
                        fromRole,
                        toRole,
                        message,
                        type,
                        mediaUrl,
                        mediaType
                    );

                    const receiverSocketIds = onlineUsers.get(to);
                    if (receiverSocketIds?.size) {
                        for (const sockId of receiverSocketIds) {
                            io.to(sockId).emit("receive-message", savedMessage);
                        }
                        await sendNotificationToUser(io, to, role, "📩 New chat", message);
                        console.log(`Message delivered to ${to}`);
                    } else {
                        console.log(`📭 ${to} is offline. Message saved but not delivered`);
                    }

                    callback({ success: true, message: savedMessage });
                } catch (error) {
                    console.error("Error in send-message:", error);
                    callback({ success: false, message: "Failed to send message" });
                }
            }
        );

        socket.on("delete-message", async ({ messageId, userId }) => {
            try {
                if (!messageId || !userId) {
                    socket.emit("error", { message: "Invalid delete request" });
                    return;
                }

                const message = await messageRepo.findById(messageId);
                if (!message) {
                    socket.emit("error", { message: "Message not found" });
                    return;
                }

                if (message.senderId.toString() !== userId) {
                    socket.emit("error", {
                        message: "You can only delete your own message",
                    });
                    return;
                }

                await chatService.deleteMessage(new Types.ObjectId(messageId));

                const receiverSocketIds = onlineUsers.get(message.receiverId.toString());
                const senderSocketIds = onlineUsers.get(userId);

                if (receiverSocketIds) {
                    for (const sockId of receiverSocketIds) {
                        io.to(sockId).emit("message-deleted", { messageId });
                    }
                }

                if (senderSocketIds) {
                    for (const sockId of senderSocketIds) {
                        io.to(sockId).emit("message-deleted", { messageId });
                    }
                }
            } catch (error) {
                console.error("❌ Error in delete-message:", error);
                socket.emit("error", { message: "Failed to delete message" });
            }
        });

        socket.on("disconnect", () => {
            for (const [userId, socketsSet] of onlineUsers.entries()) {
                if (socketsSet.has(socket.id)) {
                    socketsSet.delete(socket.id);
                    if (socketsSet.size === 0) {
                        onlineUsers.delete(userId);
                        console.log(`❌ ${userId} went offline`);
                    } else {
                        onlineUsers.set(userId, socketsSet);
                        console.log(`✅ ${userId} disconnected socket: ${socket.id}`);
                    }
                    break;
                }
            }
        });

        // Additional socket features
        registerNotificationSocketHandlers(io, socket);
        registerWebRTCSocketHandlers(io, socket);
    });
};
