import { Router} from "express";
import AdminRepository from "../../repositories/implementation/admin/adminRepository";
import { AdminService } from "../../services/implementation/admin/AdminService";
import AdminController from "../../controller/implementation/admin/adminController";
import authMiddleWare from "../../middleware/authMiddleware";
import DepartmentRepository from "../../repositories/implementation/department/departmentRepository";
import DepartmentService from "../../services/implementation/department/departmentService";
import DepartmentController from "../../controller/implementation/department/departmentController";


const router = Router();


const adminRepository = new AdminRepository()
const adminService = new AdminService(adminRepository)
const adminController = new AdminController(adminService)
const departmentRepository = new DepartmentRepository()
const departmentService = new DepartmentService(departmentRepository)
const departmentController = new DepartmentController(departmentService)

router.post("/login",(req,res)=>adminController.login(req,res))
router.post("/logout",(req,res)=>adminController.logout(req,res))
router.get("/doctors",authMiddleWare,(req,res)=>adminController.fetchAllDoctors(req,res))
router.post("/adddepartment",authMiddleWare,(req,res)=>departmentController.createDepartment(req,res))
router.get("/getalldepartments",authMiddleWare,(req,res)=>departmentController.getAllDepatments(req,res))
router.get("/users",(req,res)=>adminController.getAllUsers(req,res))
export default router