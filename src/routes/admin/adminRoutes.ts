import { Router } from "express";
import AdminRepository from "../../repositories/implementation/admin/adminRepository";
import { AdminService } from "../../services/implementation/admin/AdminService";
import AdminController from "../../controller/implementation/admin/adminController";
import authMiddleWare from "../../middleware/authMiddleware";
import DepartmentRepository from "../../repositories/implementation/department/departmentRepository";
import DepartmentService from "../../services/implementation/department/departmentService";
import DepartmentController from "../../controller/implementation/department/departmentController";
import UserRepository from "../../repositories/implementation/user/userRepository";
import UserService from "../../services/implementation/user/userService";
import UserController from "../../controller/implementation/user/userController";
import DoctorRepository from "../../repositories/implementation/doctor/doctorRepository";
import SubscriptionRepositroy from "../../repositories/implementation/subscription/subscriptionRepository";
import SubscriptionService from "../../services/implementation/subscription/subscriptionService";
import SubscriptionController from "../../controller/implementation/subscription/subscriptionContrloller";
import { checkRole } from "../../middleware/checkRole";
import { Roles } from "../../types/roles";
import WalletRepository from "../../repositories/implementation/wallet/WalletRepository";
import WalletService from "../../services/implementation/wallet/WalletService";
import AdminDashboardService from "../../services/implementation/adminDashboardService/adminDashboardService";
import AdminDashboardRepository from "../../repositories/implementation/adminDashboard/AdminDashboard";
import AdminDashboardController from "../../controller/implementation/adminDashboardController/adminDashboardController";

const router = Router();

const doctorRepository = new DoctorRepository();

const departmentRepository = new DepartmentRepository();
const departmentService = new DepartmentService(departmentRepository);
const departmentController = new DepartmentController(departmentService);

const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService, walletService);

const adminRepository = new AdminRepository();
const adminService = new AdminService(
    adminRepository,
    doctorRepository,
    userRepository
);
const adminController = new AdminController(adminService);

const subscriptionRepository = new SubscriptionRepositroy();
const subscriptionService = new SubscriptionService(subscriptionRepository);
const subscriptionController = new SubscriptionController(subscriptionService);

const adminDashboardRepository = new AdminDashboardRepository();
const adminDashboardService = new AdminDashboardService(
    adminDashboardRepository
);
const adminDashboardController = new AdminDashboardController(
    adminDashboardService
);

router.post("/login", (req, res) => adminController.login(req, res));
router.post("/logout", (req, res) => adminController.logout(req, res));
router.get("/doctors", authMiddleWare, checkRole(Roles.Admin), (req, res) =>
    adminController.fetchAllDoctors(req, res)
);
router.post(
    "/adddepartment",
    authMiddleWare,
    checkRole(Roles.Admin),
    (req, res) => departmentController.createDepartment(req, res)
);
router.get("/getalldepartments", authMiddleWare, (req, res) =>
    departmentController.getAllDepatments(req, res)
);

router.get("/users", authMiddleWare, checkRole(Roles.Admin), (req, res) =>
    adminController.getAllUsers(req, res)
);
router.put(
    "/updateStatus",
    authMiddleWare,
    checkRole(Roles.Admin),
    (req, res) => userController.UpdateUserStatus(req, res)
);

router.post("/refresh-token", (req, res) => {
    adminController.renewAuthTokens(req, res)
})


router.put(
    "/update-department-status",
    authMiddleWare,
    checkRole(Roles.Admin),
    (req, res) => departmentController.updateDepartmentStatus(req, res)
);
router.put(
    "/update-doctor-status",
    authMiddleWare,
    checkRole(Roles.Admin),
    (req, res) => adminController.updateDoctorStatus(req, res)
);
router.post(
    "/create-subscription-plan",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await subscriptionController.createsubscriptionPlan(req, res);
    }
);
router.get(
    "/get-subscription-plans",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await subscriptionController.getSubscriptionPlans(req, res);
    }
);

router.put(
    "/toggle-subscription-status",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await subscriptionController.toggleSubscriptionStatus(req, res);
    }
);

router.get(
    "/update-plan",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await subscriptionController.updateSubscriptionPlan(req, res);
    }
);

// Returns total revenue, active subscriptions, top plans
router.get(
    "/subscription/overview",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await adminDashboardController.getOverView(req, res);
    }
);

// Monthly revenue (chart data)
router.get(
    "/subscription/revenue-trend",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await adminDashboardController.getRevenueTrend(req, res);
    }
);

// Plan-wise subscription count (for pie chart)
router.get(
    "/subscription/plan-distribution",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await adminDashboardController.getPlanDistribution(req, res);
    }
);

//report download
router.get(
    "/subscription/report/download",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await adminDashboardController.downloadSubscriptionReport(req, res);
    }
);

router.get(
    "/doctor-analytics/summary",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await adminDashboardController.getDoctorAnalyticsSummary(req, res);
    }
);
router.get(
    "/doctor-analytics/revenue-trend",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await adminDashboardController.getDoctorRevenueTrend(req, res);
    }
);
router.get(
    "/doctor-analytics/service-revenue",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await adminDashboardController.getServiceRevenue(req, res);
    }
);
router.get(
    "/doctor-analytics/top-performing",
    authMiddleWare,
    checkRole(Roles.Admin),
    async (req, res) => {
        await adminDashboardController.getTopPerformingDoctors(req, res);
    }
);

router.get(
    "/view-document/:type/:doctorId",
    authMiddleWare,
    checkRole(Roles.Admin),
    (req, res) => adminController.viewDoctorDocument(req, res)
);

router.get("/getallPaginateddepartments", authMiddleWare, (req, res) =>
  departmentController.getAllPaginatedDepatments(req, res)
);
export default router;
