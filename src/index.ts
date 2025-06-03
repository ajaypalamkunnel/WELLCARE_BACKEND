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
import agoraRouter from './routes/agora/agoraTokenRoute';
import { startPendingSlotCleanupJob } from './jobs/pendingSlotCleanup';
import { initializeSocket } from './utils/chatSocket';

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
export const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
})

initializeSocket(io)


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