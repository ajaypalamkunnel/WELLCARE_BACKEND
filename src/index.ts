import express from "express";
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/dbConfig";
import userRouter from "./routes/user/userRoutes";
import adminRouter from "./routes/admin/adminRoutes";
import chatRouter from "./routes/chat/chatRoutes";
import doctorRouter from "./routes/doctor/doctorRoutes";
import session from "express-session";
import passport from "passport";
import { Server as SocketIOServer } from "socket.io";
import "./config/passport";
import morganMiddleware from "./middleware/morganMiddleware";
import agoraRouter from "./routes/agora/agoraTokenRoute";
import { startPendingSlotCleanupJob } from "./jobs/pendingSlotCleanup";
import { initializeSocketServer } from "./utils/chatSocket";
import { ROUTE_PATH } from "./constants/routePaths";

connectDB();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(
    cors({
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
    })
);

//options
app.options("*", cors());

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(bodyParser.json());
app.use(morganMiddleware);

// Session
app.use(
    session({
        secret: "wellcare",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true },
    })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Socket.io
export const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "https://wellcare.space",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    },
});

initializeSocketServer(io)
// Routes
app.use(ROUTE_PATH.USER, userRouter);
app.use(ROUTE_PATH.DOCTOR, doctorRouter);
app.use(ROUTE_PATH.ADMIN, adminRouter);
app.use(ROUTE_PATH.CHAT, chatRouter);
app.use(ROUTE_PATH.AGORA, agoraRouter);
app.get(ROUTE_PATH.WELCOME, (req, res) => {
    res.send("Welcome to Wellcare");
});

startPendingSlotCleanupJob().then(() => {
    console.log("🕒 Pending slot cleanup cron initialized");
});

server.listen(PORT, () => console.log(`Server connected on port ${PORT}`));
