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
import { checkRole } from "../../middleware/checkRole";
import { Roles } from "../../types/roles";
import DoctorScheduleRepository from "../../repositories/implementation/doctorService/doctorScheduleRepository";
import DoctorScheduleService from "../../services/implementation/doctorServiceService/DoctorScheduleService";
import DoctorScheduleController from "../../controller/implementation/doctorServiceController/doctorScheduleController";
import ConsultationBookingRepository from "../../repositories/implementation/consultationBooking/consultationBookingRepository";
import ConsultationBookingService from "../../services/implementation/consultationBooking/consultationBookingService";
import DoctorServiceRepository from "../../repositories/implementation/doctorService/doctorServiceRepository";
import ConsultationBookingController from "../../controller/implementation/consultationBooking/consultationBookingController";
import WalletRepository from "../../repositories/implementation/wallet/WalletRepository";
import WalletService from "../../services/implementation/wallet/WalletService";
import MessageRepository from "../../repositories/implementation/chat/MessageRepository";
import ChatService from "../../services/implementation/chat/messageService";
import MessageController from "../../controller/implementation/chat/MessageController";
const router = Router();


const doctorScheduleRepository = new DoctorScheduleRepository()
const doctorScheduleService = new DoctorScheduleService(doctorScheduleRepository)
const doctorScheduleController = new DoctorScheduleController(doctorScheduleService)

const userRepository = new UserRepository()
const userService = new UserService(userRepository)
const userController = new UserController(userService)


const departmentRepository = new DepartmentRepository()
const departmentService = new DepartmentService(departmentRepository)
const departmentController = new DepartmentController(departmentService)

const doctorServiceRepository = new DoctorServiceRepository()



const doctorRepository = new DoctorRepository()
const doctorService = new DoctorService(doctorRepository)
const doctorController = new DoctorController(doctorService)

const walletRepository = new WalletRepository()
const walletService = new WalletService(walletRepository)
const consultationBookingRepository = new ConsultationBookingRepository()
const consultationBookingService = new ConsultationBookingService(consultationBookingRepository,doctorScheduleRepository,doctorServiceRepository,walletRepository,walletService)
const consultationBookingController = new ConsultationBookingController(consultationBookingService)

const chatRepository = new MessageRepository()
const chatService = new ChatService(chatRepository)
const chatController = new MessageController(chatService)



router.post("/signup/basic_details", (req, res) => userController.registerBasicDetails(req, res))
router.post("/signup/resend_otp", async (req, res) => { await userController.resendOtp(req, res) })
router.post("/signup/verify_otp", async (req, res) => { await userController.verifyOtp(req, res) })

router.post("/login", (req, res) => userController.postLogin(req, res))
router.post("/forgot-password", (req, res) => userController.forgotPassword(req, res))
router.post("/update-password", (req, res) => userController.updatePassword(req, res))
router.post("/refresh-token", (req, res) => userController.renewAuthTokens(req, res))
router.post("/logout", async (req, res) => {
    await userController.logout(req, res)
})

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => userController.googleAuthCallback(req, res)
);

router.get("/profile", authMiddleWare, checkUserBlocked,checkRole(Roles.USER), (req, res) => userController.getProfile(req, res))

router.get("/get-all-active-departments", async (req, res) => { await departmentController.getAllActiveDepartments(req, res) })

router.get("/doctors", async (req, res) => {
    await doctorController.getDoctors(req, res);
});
router.get("/doctor-profile/:doctorId", async (req, res) => {
    await doctorController.getDoctorProfile(req, res)
})

router.put("/change-password", authMiddleWare, checkUserBlocked,checkRole(Roles.USER), async (req, res) => {
    await userController.changePassword(req, res)
})

router.put("/complete-registration", authMiddleWare,checkUserBlocked,checkRole(Roles.USER),async (req,res)=>{
    await userController.completeUserRegistration(req,res)
})


router.get("/schedules",authMiddleWare,checkUserBlocked,checkRole(Roles.USER),async (req,res)=>{
    await userController.getDoctorSchedules(req,res)
})



router.post("/consultation-booking/initiate",authMiddleWare,checkUserBlocked,checkRole(Roles.USER),async(req,res)=>{
    await consultationBookingController.initiateAppointment(req,res)
})

router.post("/consultation-booking/verify",authMiddleWare,checkUserBlocked,checkRole(Roles.USER),async(req,res)=>{
    await consultationBookingController.verifyAppointment(req,res)
})

router.get("/consultation-booking/details",authMiddleWare,checkUserBlocked,checkRole(Roles.USER),async(req,res)=>{
    await consultationBookingController.fetchBookingDetails(req,res)
})
router.get("/my-appoinments",authMiddleWare,checkUserBlocked,checkRole(Roles.USER),async(req,res)=>{
    await consultationBookingController.getUserAppointments(req,res)
})
router.get("/my-appoinments-detail/:id",authMiddleWare,checkUserBlocked,checkRole(Roles.USER),async(req,res)=>{
    await consultationBookingController.getAppointmentDetail(req,res)
})


router.patch("/appointments/:id/cancel",authMiddleWare,checkUserBlocked,checkRole(Roles.USER),async(req,res)=>{
    await consultationBookingController.cancelAppointment(req,res)
})



//inbox left side panel
router.get("/inbox",authMiddleWare,checkRole(Roles.USER),(req,res)=>{
    chatController.getUserInbox(req,res)
})

// this is for fetching user information,
router.get("/user-info/:userId",authMiddleWare,checkRole(Roles.DOCTOR),async(req,res)=>{
    await userController.getUserInfoForChat(req,res)
})




//wallet

router.get("/wallet")


export default router