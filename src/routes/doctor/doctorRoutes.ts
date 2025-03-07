import { Router } from "express";
import DoctorRepository from "../../repositories/implementation/doctor/doctorRepository";
import DoctorService from "../../services/implementation/doctor/doctorService";
import DoctorController from "../../controller/implementation/doctor/doctorController";
import passport from "passport";
import authMiddleWare from "../../middleware/authMiddleware";


const router = Router();

const doctorRepository = new DoctorRepository()
const doctorService = new DoctorService(doctorRepository)
const doctorController = new DoctorController(doctorService)

router.post("/signup/basic_details", (req, res) => doctorController.registerBasicDetails(req, res))
router.post("/signup/resend_otp", async (req, res) => { await doctorController.resendOtp(req, res) })
router.post("/signup/verify_otp", (req, res) => doctorController.verifyOtp(req, res))

router.post("/login", (req, res) => doctorController.postLogin(req, res))
router.post("/logout", async (req, res) => await doctorController.logoutDoctor(req, res))
router.post("/forgot-password", (req, res) => doctorController.forgotPasswordDoctor(req, res))
router.post("/update-password", (req, res) => doctorController.updatePasswordDoctor(req, res))
router.post("/refresh-token", (req, res) => doctorController.renewAuthTokens(req, res))

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => doctorController.googleAuthCallback(req, res))


router.get("/profile", authMiddleWare, (req, res) => doctorController.getProfile(req, res))
router.post("/doctorregistration", (req, res) => doctorController.registerDoctor(req, res))


export default router