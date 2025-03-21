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


const router = Router();


const doctorRepository = new DoctorRepository()

const departmentRepository = new DepartmentRepository()
const departmentService = new DepartmentService(departmentRepository)
const departmentController = new DepartmentController(departmentService)

const userRepository = new UserRepository()
const userService = new UserService(userRepository)
const userController = new UserController(userService)

const adminRepository = new AdminRepository()
const adminService = new AdminService(adminRepository, doctorRepository, userRepository)
const adminController = new AdminController(adminService)


const subscriptionRepository = new SubscriptionRepositroy()
const subscriptionService = new SubscriptionService(subscriptionRepository)
const subscriptionController = new SubscriptionController(subscriptionService)

router.post("/login", (req, res) => adminController.login(req, res))
router.post("/logout", (req, res) => adminController.logout(req, res))
router.get("/doctors", authMiddleWare, (req, res) => adminController.fetchAllDoctors(req, res))
router.post("/adddepartment", authMiddleWare, (req, res) => departmentController.createDepartment(req, res))
router.get("/getalldepartments", authMiddleWare, (req, res) => departmentController.getAllDepatments(req, res))
router.get("/users", authMiddleWare, (req, res) => adminController.getAllUsers(req, res))
router.put("/updateStatus", authMiddleWare, (req, res) => userController.UpdateUserStatus(req, res))
router.put("/update-department-status", authMiddleWare, (req, res) => departmentController.updateDepartmentStatus(req, res))
router.put("/update-doctor-status", authMiddleWare, (req, res) => adminController.updateDoctorStatus(req, res))
router.post("/create-subscription-plan", authMiddleWare, async (req, res) => {
    await subscriptionController.createsubscriptionPlan(req, res)
})
router.get("/get-subscription-plans", authMiddleWare, async (req, res) => {
    await subscriptionController.getSubscriptionPlans(req, res)
})

router.put("/toggle-subscription-status", authMiddleWare, async (req, res) => {
    await subscriptionController.toggleSubscriptionStatus(req, res)
})

router.put("/update-plan", authMiddleWare, async (req, res) => {
    await subscriptionController.updateSubscriptionPlan(req, res)
})
export default router