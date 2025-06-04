import express, { Request, RequestHandler, Response } from "express";
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
import { Socket, Server as SocketIOServer } from "socket.io";
import "./config/passport";
import morganMiddleware from "./middleware/morganMiddleware";
import agoraRouter from "./routes/agora/agoraTokenRoute";
import { startPendingSlotCleanupJob } from "./jobs/pendingSlotCleanup";
import { initializeSocket } from "./utils/chatSocket";
// import sharedsession from "express-socket.io-session";

connectDB();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Session

const sessionMiddleWare = session({
    secret: "wellcare",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, httpOnly: true },
});

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

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(bodyParser.json());
app.use(morganMiddleware);


// Session
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "https://wellcare.space",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["set-cookie"],
    })
);

// Passport
app.use(sessionMiddleWare);
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

const wrap = (middleware: RequestHandler) => (socket: Socket, next: (err?: any) => void) => {
    middleware(socket.request as Request, {} as Response, next);
}


io.use(wrap(sessionMiddleWare));

//initilize socket
initializeSocket(io);

// Routes
app.use("/", userRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRouter);
app.use("/api/agora", agoraRouter);
app.get("/", (req, res) => {
    res.send("Welcome to Wellcare");
});

startPendingSlotCleanupJob().then(() => {
    console.log("🕒 Pending slot cleanup cron initialized");
});

server.listen(PORT, () => console.log(`Server connected on port ${PORT}`));
