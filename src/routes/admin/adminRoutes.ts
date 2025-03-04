import { Router} from "express";
import AdminRepository from "../../repositories/implementation/admin/adminRepository";
import { AdminService } from "../../services/implementation/admin/AdminService";
import AdminController from "../../controller/implementation/admin/adminController";
import authMiddleWare from "../../middleware/authMiddleware";


const router = Router();


const adminRepository = new AdminRepository()
const adminService = new AdminService(adminRepository)
const adminController = new AdminController(adminService)

router.post("/login",(req,res)=>adminController.login(req,res))
router.post("/logout",(req,res)=>adminController.logout(req,res))
router.get("/doctors",authMiddleWare,(req,res)=>adminController.fetchAllDoctors(req,res))
export default router