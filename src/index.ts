import express from 'express';
import dotenv from 'dotenv';
import http from 'http'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser';
import cors from 'cors'
import connectDB from './config/dbConfig';
import morgan from 'morgan';
import userRouter from './routes/user/userRoutes'
import adminRouter from './routes/admin/adminRoutes'
import doctorRouter from './routes/doctor/doctorRoutes'
import session from 'express-session'
import passport from 'passport'
import "./config/passport"
import morganMiddleware from './middleware/morganMiddleware';
connectDB()
const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000 

dotenv.config()
app.use(cookieParser())
app.use(express.json({limit:'100mb'}))
app.use(express.urlencoded({limit:'100mb', extended: true}))
app.use(bodyParser.json())
app.use(morganMiddleware);

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
}))


// app.use(morgan('dev'));
// **Session Middleware (Required for Passport)**

app.use(
    session({
        secret:"wellcare",
        resave:false,
        saveUninitialized:false,
        cookie:{secure:false,httpOnly:true}
    })
)

// **Initialize Passport**

app.use(passport.initialize())
app.use(passport.session())


app.use("/",userRouter)
app.use("/api/doctor",doctorRouter)
app.use("/api/admin",adminRouter)


app.get('/',(req,res)=>{
    console.log("hiiii");
    
    res.send("Welcome to Wellcare")
})

server.listen(PORT,()=>console.log(`Server connected on port ${PORT}`));
