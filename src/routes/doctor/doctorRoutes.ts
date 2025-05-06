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
import MessageRepository from "../../repositories/implementation/chat/MessageRepository";
import ChatService from "../../services/implementation/chat/messageService";
import MessageController from "../../controller/implementation/chat/MessageController";
import PrescriptionRepository from "../../repositories/implementation/prescription/Prescription";
import PrescriptionService from "../../services/implementation/prescription/prescriptionService";
import PrescriptionController from "../../controller/implementation/prescription/PrescriptionController";
import DoctorWallet from "../../model/doctorWallet/doctorWallet";
import DoctorWalletRepository from "../../repositories/implementation/doctorWallet/DoctorWallet";
import DoctorWalletService from "../../services/implementation/doctorWallet/doctorWalletService";
import DoctorDashboardService from "../../services/implementation/dashboardService/DoctorDashboardService";
import DoctorDashboardRepository from "../../repositories/implementation/dashboard/DoctorDashboardRepository";
import DoctorDashboardController from "../../controller/implementation/dashboardController/DoctorDashboardController";


const router = Router();

const doctorWalletRepo = new DoctorWalletRepository()
const doctorWalletService = new DoctorWalletService(doctorWalletRepo)

const doctorRepository = new DoctorRepository()
const doctorService = new DoctorService(doctorRepository)
const doctorController = new DoctorController(doctorService, doctorWalletService)


const subscriptionRepository = new SubscriptionRepositroy()
const subscriptionService = new SubscriptionService(subscriptionRepository)
const subscriptionController = new SubscriptionController(subscriptionService)


const doctorSubscriptionRepository = new DoctorSubscriptionRepository()
const doctorSubscriptionService = new DoctorSubscriptionService(doctorSubscriptionRepository, subscriptionRepository, doctorRepository)
const doctorSubscriptionController = new DoctorSubscriptionController(doctorSubscriptionService)

const doctorServiceRepository = new DoctorServiceRepository()
const doctorServiceService = new DoctorServiceService(doctorServiceRepository, doctorRepository, doctorSubscriptionRepository)
const doctorServiceController = new DoctorServiceController(doctorServiceService)


const walletRepository = new WalletRepository()
const walletService = new WalletService(walletRepository)


const doctorScheduleRepository = new DoctorScheduleRepository()
const doctorScheduleService = new DoctorScheduleService(doctorScheduleRepository, walletRepository)
const doctorScheduleController = new DoctorScheduleController(doctorScheduleService)

const consultationAppointmentRepository = new ConsultationBookingRepository()
const consultationAppointmentService = new ConsultationBookingService(consultationAppointmentRepository, doctorScheduleRepository, doctorServiceRepository, walletRepository, walletService, doctorWalletRepo)
const consultationAppointmentController = new ConsultationBookingController(consultationAppointmentService)



const chatRepository = new MessageRepository()
const chatService = new ChatService(chatRepository)
const chatController = new MessageController(chatService)

const prescriptionRepo = new PrescriptionRepository()
const prescriptionService = new PrescriptionService(prescriptionRepo, doctorWalletRepo, consultationAppointmentRepository)
const prescriptionController = new PrescriptionController(prescriptionService)

const doctorDashboardRepository = new DoctorDashboardRepository()
const doctorDashboardService = new DoctorDashboardService(doctorDashboardRepository)
const doctorDashboardController = new DoctorDashboardController(doctorDashboardService)



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


router.get("/profile", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), (req, res) => doctorController.getProfile(req, res))
router.post("/doctorregistration", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), (req, res) => doctorController.registerDoctor(req, res))
router.put("/updatestatus", authMiddleWare, checkRole(Roles.DOCTOR), (req, res) => doctorController.updateDoctorStatus(req, res))
router.put("/verify-doctor", authMiddleWare, (req, res) => doctorController.verifyDoctor(req, res))
router.put("/doctor-profile-update", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), (req, res) => doctorController.updateProfile(req, res))
router.put("/change-password", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorController.changePassword(req, res);
});

router.get("/subscription-plans", async (req, res) => {
    await subscriptionController.getAllSubscriptionPlans(req, res);
});


router.post("/create-order", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorSubscriptionController.createSubscriptionOrder(req, res)
})

router.post("/verify-payment", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorSubscriptionController.verifyPayment(req, res)
})

router.post("/create-service", authMiddleWare, checkDoctorBlocked, checkSubscription, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorServiceController.createDoctorService(req, res)
})

router.get("/get-services", authMiddleWare, checkDoctorBlocked, checkSubscription, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorServiceController.getDoctorServices(req, res)
})

router.put("/update-service", authMiddleWare, checkDoctorBlocked, checkSubscription, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorServiceController.doctorServiceUpdate(req, res)
})


router.get("/get-my-subscription/:subscriptionId", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorSubscriptionController.getDoctorSubscriptionn(req, res)
})


router.post("/validate-schedule", authMiddleWare, checkDoctorBlocked, checkSubscription, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorScheduleController.validateSchedule(req, res)
})


router.post("/generate-slots", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorScheduleController.generateSlot(req, res)
})

router.post("/create-schedule", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorScheduleController.createSchedule(req, res)
})


router.get("/fetch-schedules", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), async (req, res) => {

    await doctorScheduleController.listSchedules(req, res)
})

router.get("/appointments", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), async (req, res) => {
    await consultationAppointmentController.listAppointments(req, res)
})

router.get("/appointments/:appointmentId/details", authMiddleWare, checkDoctorBlocked, checkRole(Roles.DOCTOR), async (req, res) => {
    await consultationAppointmentController.getAppointmentDetailForDoctor(req, res)
})

//for inbox left side panel data
router.get("/inbox", authMiddleWare, checkRole(Roles.DOCTOR), async (req, res) => {
    await chatController.getDoctorInbox(req, res)
})

// this is for fetching doctor information,
router.get("/doctor-info/:doctorId", authMiddleWare, checkRole(Roles.USER), async (req, res) => {
    await doctorController.getDoctorInfoForChat(req, res)
})


router.post("/profile/addeducation", authMiddleWare, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorController.addEducation(req, res)
})

router.post("/profile/addCertificate", authMiddleWare, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorController.addCertification(req, res)
})
router.put("/profile/updateEducation", authMiddleWare, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorController.editEducation(req, res)
})
router.put("/profile/updateCertification", authMiddleWare, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorController.editCertification(req, res)
})


router.patch("/schedules/:scheduleId/cancel", authMiddleWare, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorScheduleController.cancelSchedule(req, res)
})


router.post("/submit-prescription", authMiddleWare, checkRole(Roles.DOCTOR), async (req, res) => {
    await prescriptionController.submitPrescription(req, res)
})
router.get("/fetch-prescription/:appointmentId", authMiddleWare, checkRole(Roles.DOCTOR), async (req, res) => {
    await prescriptionController.getPrescription(req, res)
})
router.get("/getWalletSummary", authMiddleWare, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorController.getWalletSummary(req, res)
})
router.post("/withdraw", authMiddleWare, checkRole(Roles.DOCTOR), async (req, res) => {
    await doctorController.witdraw(req, res)
})

//report generation Rourtes

router.get(
    "/appointment-summary",
    authMiddleWare,
    checkRole(Roles.DOCTOR),
    async (req, res) => {
        await doctorDashboardController.getAppointmentSummary(req, res);
    }
);

router.get(
    "/appointment-trend",
    authMiddleWare,
    checkRole(Roles.DOCTOR),
    async (req, res) => {
        await doctorDashboardController.getAppointmentTrend(req, res)
    }
);
router.get(
    "/revenue-trend",
    authMiddleWare,
    checkRole(Roles.DOCTOR),
    async (req, res) => {
        await doctorDashboardController.getRevenueTrend(req, res)
    }
);
router.get(
    "/generate-report",
    authMiddleWare,
    checkRole(Roles.DOCTOR),
    async (req, res) => {
        await doctorDashboardController.generateDoctorReport(req, res)
    }
);
router.get(
    "/top-services",
    authMiddleWare,
    checkRole(Roles.DOCTOR),
    async (req, res) => {
        await doctorDashboardController.getTopServices(req, res)
    }
);





export default router