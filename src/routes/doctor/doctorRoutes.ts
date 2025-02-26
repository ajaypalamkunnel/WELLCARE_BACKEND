import { Router} from "express";
import DoctorRepository from "../../repositories/implementation/doctor/doctorRepository";
import DoctorService from "../../services/implementation/doctor/doctorService";
import DoctorController from "../../controller/implementation/doctor/doctorController";


const router = Router();

const doctorRepository = new DoctorRepository()
const doctorService = new DoctorService(doctorRepository)
const doctorController = new DoctorController(doctorService)

router.post("/signup/basic_details",(req,res)=>doctorController.registerBasicDetails(req,res))
router.post("/signup/resend_otp",async (req,res)=> {await doctorController.resendOtp(req,res)})
router.post("/signup/verify_otp",(req,res)=>doctorController.verifyOtp(req,res))

router.post("/login",(req,res)=>doctorController.postLogin(req,res))
router.post("/forgot-password",(req,res)=>doctorController.forgotPasswordDoctor(req,res))
router.post("/update-password",(req,res)=>doctorController.updatePasswordDoctor(req,res))
router.post("/refresh-token",(req,res)=>doctorController.renewAuthTokens(req,res))




export default router