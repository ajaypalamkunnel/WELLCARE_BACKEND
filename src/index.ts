import express from 'express';
import dotenv from 'dotenv';
dotenv.config()
import http from 'http'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser';
import cors from 'cors'
import connectDB from './config/dbConfig';
import userRouter from './routes/user/userRoutes'
import adminRouter from './routes/admin/adminRoutes'
import chatRouter from './routes/chat/chatRoutes'
import doctorRouter from './routes/doctor/doctorRoutes'
import session from 'express-session'
import passport from 'passport'
import { Server as SocketIOServer } from "socket.io";
import "./config/passport"
import morganMiddleware from './middleware/morganMiddleware';
import MessageRepository from './repositories/implementation/chat/MessageRepository';
import ChatService from './services/implementation/chat/messageService';
import { Types } from 'mongoose';
import { registerWebRTCSocketHandlers } from './utils/socket/webrtcSocket';
import { registerNotificationSocketHandlers } from './utils/notification/notificationSocket';
import { sendNotificationToUser } from './utils/notification/sendNotification';
import agoraRouter from './routes/agora/agoraTokenRoute';
import { startPendingSlotCleanupJob } from './jobs/pendingSlotCleanup';

connectDB()
const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// CORS
// app.use(cors({
//     origin: process.env.FRONTEND_URL || "https://wellcare.space",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     exposedHeaders: ["set-cookie"],
// }))

app.use(cors({
  origin: function (origin, callback) {
    console.log("CORS origin:", origin);

    const allowedOrigins = [
      "https://www.wellcare.space",
      "https://wellcare.space"
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
}));

//options
app.options("*",cors())

// Middleware
app.use(cookieParser())
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ limit: '100mb', extended: true }))
app.use(bodyParser.json())
app.use(morganMiddleware);


// Session
app.use(
    session({
        secret: "wellcare",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true }
    })
)

// Passport
app.use(passport.initialize())
app.use(passport.session())

// Socket.io
export const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "https://wellcare.space",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
})

const messageRepo = new MessageRepository()
const chatService = new ChatService(messageRepo)

export const onlineUsers = new Map<string, Set<string>>();

io.on("connection", (socket) => {
    console.log(" User connected:", socket.id);
    console.log("Cookies:", socket.handshake.headers.cookie);

    socket.on("error", (err) => {
        console.error("Socket error:", err);
    });

    socket.on("user-online", ({ userId }) => {
        if (!userId) return

        const existingSockets = onlineUsers.get(userId) || new Set()
        existingSockets.add(socket.id)

        onlineUsers.set(userId, existingSockets)
        console.log(` ${userId} is online via ${socket.id}`);
    })

    socket.on("send-message", async ({ to, message, type = "text", from, fromRole, toRole,mediaUrl,mediaType  },callback) => {
        try {

            let role: "Doctor" | "user"
            if(toRole === "User"){
                role = "user"
            }else{
                role = "Doctor"
            }



            if (!to || !from) {
                return callback({ success: false, message: "Invalid message payload" });
            }

            if (!message?.trim() && !mediaUrl?.trim()) {

                return callback({ success: false, message: "Message must contain text or media" });

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
            )

            const receiverSocketIds = onlineUsers.get(to);
            if (receiverSocketIds && receiverSocketIds.size > 0) {
                for(const sockId of receiverSocketIds){
                    io.to(sockId).emit("receive-message", savedMessage);
                }
                await sendNotificationToUser(
                    io,
                    to,
                    role,
                    "📩 New chat",
                    message
                )
                console.log(`Message delivered to ${to}`);
            }else{
                console.log(`📭 ${to} is offline. Message saved but not delivered`);
            }

            callback({ success: true, message: savedMessage });
        } catch (error) {
            console.error(" Error in send-message:", error);
            callback({ success: false, message: "Failed to send message" });
        }
    })


    socket.on("delete-message",async({messageId,userId})=>{




        try {

            if(!messageId || !userId){
                socket.emit("error",{message: "Invalid delete request"})
                return
            }


            const message = await messageRepo.findById(messageId)




            if(!message){
                socket.emit("error",{message:"Message not found"})
                return
            }

            if(message.senderId.toString() !== userId){

                socket.emit("error",{message:"You can only delete your own message"})
                return
            }

            await chatService.deleteMessage(new Types.ObjectId(messageId))

            const receiverSocketIds = onlineUsers.get(message.receiverId.toString())
            const senderSocketIds = onlineUsers.get(userId);


            if(receiverSocketIds){
                for(const sockId of receiverSocketIds){
                    io.to(sockId).emit("message-deleted",{messageId})
                }
            }

            if(senderSocketIds){
                for (const sockId of senderSocketIds) {
                    io.to(sockId).emit("message-deleted", { messageId });
                  }
            }
        } catch (error) {

            console.error("❌ Error in delete-message socket event:", error);
            socket.emit("error", { message: "Failed to delete message" });

        }

    })

    socket.on("disconnect", () => {
       for(const[userId,socketsSet] of onlineUsers.entries()){
            if(socketsSet.has(socket.id)){
                socketsSet.delete(socket.id)

                if(socketsSet.size === 0){
                    onlineUsers.delete(userId)
                    console.log(`❌ ${userId} went offline (last socket disconnected)`);
                }else{
                    onlineUsers.set(userId,socketsSet)
                    console.log(`✅ ${userId} disconnected socket: ${socket.id}, still online in ${socketsSet.size} tab(s)`);
                }
                break
            }
       }
    })
    registerNotificationSocketHandlers(io,socket)
    registerWebRTCSocketHandlers(io,socket)

    socket.on("error",(err)=>{
        console.error("Socket error:", err);
    })
})

// Routes
app.use("/", userRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/admin", adminRouter)
app.use("/api/chat",chatRouter)
app.use("/api/agora",agoraRouter)
app.get('/', (req, res) => {
    res.send("Welcome to Wellcare")
})

startPendingSlotCleanupJob().then(()=>{
    console.log("🕒 Pending slot cleanup cron initialized");
})



server.listen(PORT, () => console.log(`Server connected on port ${PORT}`));