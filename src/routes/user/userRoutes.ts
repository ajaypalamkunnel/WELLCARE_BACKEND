import { Router } from "express";
import UserController from "../../controller/implementation/user/userController"
import UserService from "../../services/implementation/user/userService"
import UserRepository from "../../repositories/implementation/user/userRepository"
import passport from "passport";
import authMiddleWare from "../../middleware/authMiddleware";
import checkUserBlocked from "../../middleware/checkUserBlocked";
import DepartmentRepository from "../../repositories/implementation/department/departmentRepository";
import DepartmentService from "../../services/implementation/department/departmentService";
import DepartmentController from "../../controller/implementation/department/departmentController";
import DoctorController from "../../controller/implementation/doctor/doctorController";
import DoctorRepository from "../../repositories/implementation/doctor/doctorRepository";
import DoctorService from "../../services/implementation/doctor/doctorService";
const router = Router();


const userRepository = new UserRepository()
const userService = new UserService(userRepository)
const userController = new UserController(userService)


const departmentRepository = new DepartmentRepository()
const departmentService = new DepartmentService(departmentRepository)
const departmentController = new DepartmentController(departmentService)

const doctorRepository = new DoctorRepository()
const doctorService = new DoctorService(doctorRepository)
const doctorController = new DoctorController(doctorService)

router.post("/signup/basic_details",(req,res)=>userController.registerBasicDetails(req,res))
router.post("/signup/resend_otp", async (req,res)=>{ await userController.resendOtp(req,res)})
router.post("/signup/verify_otp",async (req,res)=>{await userController.verifyOtp(req,res)})

router.post("/login",(req,res)=>userController.postLogin(req,res))
router.post("/forgot-password",(req,res)=>userController.forgotPassword(req,res))
router.post("/update-password",(req,res)=>userController.updatePassword(req,res))
router.post("/refresh-token",(req,res)=>userController.renewAuthTokens(req,res))
router.post("/logout",async(req,res)=>{
    await userController.logout(req,res)
})

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => userController.googleAuthCallback(req, res)
);

router.get("/profile",authMiddleWare,checkUserBlocked,(req,res)=>userController.getProfile(req,res))

router.get("/get-all-active-departments", async (req,res)=> {await departmentController.getAllActiveDepartments(req,res)})

router.get("/doctors", async (req, res) => {
    await doctorController.getDoctors(req, res);
  });
  

export default router