import { Router } from "express";
import UserController from "../../controller/implementation/user/userController"
import UserService from "../../services/implementation/user/userService"
import UserRepository from "../../repositories/implementation/user/userRepository"
const router = Router();


const userRepository = new UserRepository()
const userService = new UserService(userRepository)
const userController = new UserController(userService)

router.post("/signup/basic_details",(req,res)=>userController.registerBasicDetails(req,res))
router.post("/signup/resend_otp", async (req,res)=>{ await userController.resendOtp(req,res)})
router.post("/signup/verify_otp",async (req,res)=>{await userController.verifyOtp(req,res)})

router.post("/login",(req,res)=>userController.postLogin(req,res))
router.post("/forgot-password",(req,res)=>userController.forgotPassword(req,res))
router.post("/update-password",(req,res)=>userController.updatePassword(req,res))
router.post("/refresh-token",(req,res)=>userController.renewAuthTokens(req,res))

export default router