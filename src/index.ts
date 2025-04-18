import express from 'express';
import dotenv from 'dotenv';
dotenv.config()
import http from 'http'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser';
import cors from 'cors'
import connectDB from './config/dbConfig';
import morgan from 'morgan';
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
import DoctorRepository from './repositories/implementation/doctor/doctorRepository';

connectDB()
const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// Middleware
app.use(cookieParser())
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ limit: '100mb', extended: true }))
app.use(bodyParser.json())
app.use(morganMiddleware);

// CORS
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
}))

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
const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
})

const messageRepo = new MessageRepository()
const chatService = new ChatService(messageRepo)

export const onlineUsers = new Map<string, Set<string>>();

io.on("connection", (socket) => {
    console.log("🔗 User connected:", socket.id);
    console.log("Cookies:", socket.handshake.headers.cookie);

    socket.on("error", (err) => {
        console.error("Socket error:", err);
    });

    socket.on("user-online", ({ userId }) => {
        if (!userId) return

        const existingSockets = onlineUsers.get(userId) || new Set()
        existingSockets.add(socket.id)
        
        onlineUsers.set(userId, existingSockets)
        console.log(`✅ ${userId} is online via ${socket.id}`);
    })

    socket.on("send-message", async ({ to, message, type = "text", from, fromRole, toRole  }) => {
        try {
            console.log("***",message);
            

            if (!to || !message || !from) {
                socket.emit("error", { message: "Invalid message payload" })
                return;
            }

            const savedMessage = await chatService.sendMessage(
                new Types.ObjectId(from),
                new Types.ObjectId(to),
                fromRole,
                toRole,
                message,
                type
            )

            const receiverSocketIds = onlineUsers.get(to);
            if (receiverSocketIds && receiverSocketIds.size > 0) {
                for(const sockId of receiverSocketIds){
                    io.to(sockId).emit("receive-message", savedMessage);
                }
                console.log(`Message delivered to ${to}`);
            }else{
                console.log(`📭 ${to} is offline. Message saved but not delivered`);
            }

            socket.emit("message-sent", { success: true, message: savedMessage })
        } catch (error) {
            console.error(" Error in send-message:", error);
            socket.emit("error", { message: "Failed to send message" });
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
                    console.log(`🔌 ${userId} disconnected socket: ${socket.id}, still online in ${socketsSet.size} tab(s)`);
                }
                break
            }
       }
    })

    socket.on("error",(err)=>{
        console.error("Socket error:", err);
    })
})

// Routes
app.use("/", userRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/admin", adminRouter)
app.use("/api/chat",chatRouter)
app.get('/', (req, res) => {
    res.send("Welcome to Wellcare")
})

server.listen(PORT, () => console.log(`Server connected on port ${PORT}`));