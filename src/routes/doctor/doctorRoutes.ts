import { Router } from "express";
import DoctorRepository from "../../repositories/implementation/doctor/doctorRepository";
import DoctorService from "../../services/implementation/doctor/doctorService";
import DoctorController from "../../controller/implementation/doctor/doctorController";
import passport from "passport";
import authMiddleWare from "../../middleware/authMiddleware";
import checkDoctorBlocked from "../../middleware/checkDoctorBlocked";
import SubscriptionController from "../../controller/implementation/subscription/subscriptionContrloller";
import SubscriptionRepositroy from "../../repositories/implementation/subscription/subscriptionRepository";
import SubscriptionService from "../../services/implementation/subscription/subscriptionService";
import DoctorSubscriptionRepository from "../../repositories/implementation/doctorSubscriptions/DoctorSubscriptions";
import DoctorSubscriptionService from "../../services/implementation/doctorSubscriptionService/DoctorSubscriptionService";
import DoctorSubscriptionController from "../../controller/implementation/doctorSubscription/DoctorSubscription";
import DoctorServiceRepository from "../../repositories/implementation/doctorService/doctorServiceRepository";
import DoctorServiceService from "../../services/implementation/doctorServiceService/DoctorServiceService";
import DoctorServiceController from "../../controller/implementation/doctorServiceController/doctorServiceController";
import checkSubscription from "../../middleware/checkSubscription";
import { checkRole } from "../../middleware/checkRole";
import { Roles } from "../../types/roles";
import DoctorScheduleRepository from "../../repositories/implementation/doctorService/doctorScheduleRepository";
import DoctorScheduleService from "../../services/implementation/doctorServiceService/DoctorScheduleService";
import DoctorScheduleController from "../../controller/implementation/doctorServiceController/doctorScheduleController";
import ConsultationBookingRepository from "../../repositories/implementation/consultationBooking/consultationBookingRepository";
import ConsultationBookingService from "../../services/implementation/consultationBooking/consultationBookingService";
import WalletRepository from "../../repositories/implementation/wallet/WalletRepository";
import WalletService from "../../services/implementation/wallet/WalletService";
import ConsultationBookingController from "../../controller/implementation/consultationBooking/consultationBookingController";


const router = Router();

const doctorRepository = new DoctorRepository()
const doctorService = new DoctorService(doctorRepository)
const doctorController = new DoctorController(doctorService)


const subscriptionRepository = new SubscriptionRepositroy()
const subscriptionService = new SubscriptionService(subscriptionRepository)
const subscriptionController = new SubscriptionController(subscriptionService)


const doctorSubscriptionRepository = new DoctorSubscriptionRepository()
const doctorSubscriptionService = new DoctorSubscriptionService(doctorSubscriptionRepository, subscriptionRepository,doctorRepository)
const doctorSubscriptionController = new DoctorSubscriptionController(doctorSubscriptionService)

const doctorServiceRepository = new DoctorServiceRepository()
const doctorServiceService = new DoctorServiceService(doctorServiceRepository,doctorRepository,doctorSubscriptionRepository)
const doctorServiceController = new DoctorServiceController(doctorServiceService)

const doctorScheduleRepository = new DoctorScheduleRepository()
const doctorScheduleService = new DoctorScheduleService(doctorScheduleRepository)
const doctorScheduleController = new DoctorScheduleController(doctorScheduleService)

const walletRepository = new WalletRepository()
const walletService = new WalletService(walletRepository)

const consultationAppointmentRepository = new ConsultationBookingRepository()
const consultationAppointmentService = new ConsultationBookingService(consultationAppointmentRepository,doctorScheduleRepository,doctorServiceRepository,walletRepository,walletService)
const consultationAppointmentController = new ConsultationBookingController(consultationAppointmentService)


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


router.get("/profile", authMiddleWare, checkDoctorBlocked,checkRole(Roles.DOCTOR), (req, res) => doctorController.getProfile(req, res))
router.post("/doctorregistration", authMiddleWare, checkDoctorBlocked,checkRole(Roles.DOCTOR), (req, res) => doctorController.registerDoctor(req, res))
router.put("/updatestatus", authMiddleWare,checkRole(Roles.DOCTOR), (req, res) => doctorController.updateDoctorStatus(req, res))
router.put("/verify-doctor", authMiddleWare,(req, res) => doctorController.verifyDoctor(req, res))
router.put("/doctor-profile-update", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR),(req, res) => doctorController.updateProfile(req, res))
router.put("/change-password", authMiddleWare, checkDoctorBlocked,checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorController.changePassword(req, res);
});

router.get("/subscription-plans", async (req, res) => {
    await subscriptionController.getAllSubscriptionPlans(req, res);
});


router.post("/create-order", authMiddleWare, checkDoctorBlocked,checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorSubscriptionController.createSubscriptionOrder(req, res)
})

router.post("/verify-payment", authMiddleWare, checkDoctorBlocked,checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorSubscriptionController.verifyPayment(req, res)
})

router.post("/create-service",authMiddleWare,checkDoctorBlocked,checkSubscription,checkRole(Roles.DOCTOR), async (req,res)=>{
    await doctorServiceController.createDoctorService(req,res)
})

router.get("/get-services",authMiddleWare,checkDoctorBlocked,checkSubscription,checkRole(Roles.DOCTOR), async (req,res)=>{
    await doctorServiceController.getDoctorServices(req,res)
})

router.put("/update-service",authMiddleWare,checkDoctorBlocked,checkSubscription,checkRole(Roles.DOCTOR), async (req,res)=>{
    await doctorServiceController.doctorServiceUpdate(req,res)
})


router.get("/get-my-subscription/:subscriptionId",authMiddleWare,checkDoctorBlocked,checkRole(Roles.DOCTOR),async(req,res)=>{
    await doctorSubscriptionController.getDoctorSubscriptionn(req,res)})


router.post("/validate-schedule",authMiddleWare,checkDoctorBlocked,checkSubscription,checkRole(Roles.DOCTOR),async (req,res)=>{
    await doctorScheduleController.validateSchedule(req,res)
})


router.post("/generate-slots",authMiddleWare,checkDoctorBlocked,checkRole(Roles.DOCTOR),async(req,res)=>{
    await doctorScheduleController.generateSlot(req,res)
})

router.post("/create-schedule",authMiddleWare,checkDoctorBlocked,checkRole(Roles.DOCTOR),async(req,res)=>{
    await doctorScheduleController.createSchedule(req,res)
})


router.get("/fetch-schedules",authMiddleWare,checkDoctorBlocked,checkRole(Roles.DOCTOR),async(req,res)=>{
    console.log("hi gutsssss");
    
    await doctorScheduleController.listSchedules(req,res)
})

router.get("/appointments",authMiddleWare,checkDoctorBlocked,checkRole(Roles.DOCTOR),async(req,res)=>{
    await consultationAppointmentController.listAppointments(req,res)
})

router.get("/appointments/:appointmentId/details",authMiddleWare,checkDoctorBlocked,checkRole(Roles.DOCTOR),async(req,res)=>{
    await consultationAppointmentController.getAppointmentDetailForDoctor(req,res)
})

export default router