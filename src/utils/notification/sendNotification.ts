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

    console.log("ivade vannuuu");
    

    const saved = await saveNotification(
       { userId,
        userRole,
        title,
        message,
        link,
        type:"appointment"}
    )


    const socketSet = onlineUsers.get(userId)

    console.log("Before emiting =>",socketSet);

    if(socketSet){
        for(const socketId of socketSet){
            io.to(socketId).emit("receive-notification", saved);
        }
        console.log("emited = >",saved);
    }

    return saved
}