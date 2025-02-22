import { Router } from "express";
import UserController from "../../controller/implementation/user/userController"
import UserService from "../../services/implementation/user/userService"
import UserRepository from "../../repositories/implementation/user/userRepository"
const router = Router();


const userRepository = new UserRepository()
const userService = new UserService(userRepository)
const userController = new UserController(userService)

router.post("/signup/basic_details",(req,res)=>userController.registerBasicDetails(req,res))
router.post("/signup/send_otp", async (req,res)=>{ await userController.sendOtp(req,res)})
router.post("/signup/verify_otp",async (req,res)=>{await userController.verifyOtp(req,res)})




export default router