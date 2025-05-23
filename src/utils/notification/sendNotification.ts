import { Server } from "socket.io";
import { saveNotification } from "./notification";
import { onlineUsers } from "../../index";


export const sendNotificationToUser = async(
    io: Server,
  userId: string,
  userRole: "Doctor"|"user" ,
  title: string,
  message: string,
  link?: string
)=>{

    

    const saved = await saveNotification(
       { userId,
        userRole,
        title,
        message,
        link,
        type:"appointment"}
    )


    const socketSet = onlineUsers.get(userId)


    if(socketSet){
        for(const socketId of socketSet){
            io.to(socketId).emit("receive-notification", saved);
        }
        
    }

    return saved
}