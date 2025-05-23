
import { Server, Socket } from "socket.io";
import { saveNotification } from "./notification";
import { onlineUsers } from "../..";

export const registerNotificationSocketHandlers = (io: Server, socket: Socket) => {


    socket.on("send-notification", async (data, callback) => {

        try {

            const { userId, userRole, title, message, link, type } = data;

            if (!userId || !userRole || !title || !message) {
                return callback({ success: false, message: "Missing required fields" })
            }

            const notification = await saveNotification(
                {
                    userId,
                    userRole,
                    title,
                    message,
                    link,
                    type,
                }
            )

            const socketIds = onlineUsers.get(userId)

            

            if (socketIds) {
                for (const id of socketIds) {
                    io.to(id).emit("receive-notification", notification)
                }
                
            }

            callback({ success: true, data: notification });

        } catch (error) {
            console.error("Notification socket error:", error);
            callback({ success: false, message: "Internal error" });
        }

    })

}