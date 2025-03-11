import { Request, Response } from 'express';
import IAdminController from '../../interfaces/admin/IAdminController'
import { IAdminService } from '../../../services/interfaces/admin/IAdminServices';
import { error } from 'console';
import { StatusCode } from '../../../constants/statusCode';
import { STATUS_CODES } from 'http';

class AdminController implements IAdminController {

    private _adminService: IAdminService

    constructor(adminService: IAdminService) {
        this._adminService = adminService
    }
    
   
    
    


    async login(req: Request, res: Response): Promise<void> {


        try {

            const { email, password } = req.body;

            if (!email || !password) {
                res.status(StatusCode.BAD_REQUEST).json({ error: "Email and password are required" })
                return
            }

            const { accessTokenAdmin, refreshTokenAdmin, admin } = await this._adminService.loginAdmin(email, password)

            res.cookie("refreshTokenAdmin", refreshTokenAdmin, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            res.cookie("accessTokenAdmin", accessTokenAdmin, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 2 * 60 * 60 * 1000, // 2 hours
            });

            res.status(StatusCode.OK).json({
                success: true,
                message: "Login successfull",
                accessTokenAdmin,
                admin: { id: admin?._id, email: admin?.email }
            })
        } catch (error: unknown) {
            res.status(StatusCode.BAD_REQUEST).json({ error: error instanceof Error ? error.message : "Login failed" })
        }

    }


    async logout(req:Request,res:Response):Promise<void>{
        try {
          
            res.clearCookie("refreshTokenAdmin",{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"strict"
            })

            res.clearCookie("accessTokenAdmin",{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"strict"

            })

            res.status(StatusCode.OK).json({
                success:true,
                message:"Logout successfull"
            })
            
        } catch (error:unknown) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({error:"logout failed"})
        }
    }


    async fetchAllDoctors(req: Request, res: Response): Promise<void> {
        try {
            const doctors = await this._adminService.fetchAllDoctors()

            if (!doctors || doctors.length === 0) {
                res.status(StatusCode.NOT_FOUND).json({ success: false, message: "No doctors found" });
                return;
            }

            res.status(StatusCode.OK).json({ success: true, data: doctors });
        } catch (error) {
            console.error("Error fetching doctors:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal Server Error" });
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 10
            console.log("page===>",page);
            console.log("limit===>",limit);
            
            const {users,totalUsers} = await this._adminService.getAllUsers(page,limit)
            
             res.status(StatusCode.OK).json({
                success:true,
                message:"Users retrived successfully",
                data:{users,totalUsers,currentPage: page, totalPages: Math.ceil(totalUsers! / limit) }
            })
        } catch (error) {
            console.error(`Controller Error: ${error instanceof Error ? error.message : error}`);

            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:error instanceof Error ? error.message : "An unexpected error occurred"
            })
            
        }
    }

    async updateDoctorStatus(req: Request, res: Response): Promise<void> {
        console.log("updated conrtoller");
        try {
            const { doctorId, status } = req.body

            console.log("==>", doctorId, "==>,", status);


            if (!doctorId || (status !== 1 && status !== -1)) {

                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid request. Provide doctorId and valid status (-1 for block, 1 for unblock)."

                })
                return
            }

            const doctor = await this._adminService.updateDoctorStatus(doctorId, status)

            res.status(StatusCode.OK).json({
                success: true,
                message: `Doctor ${status === -1 ? "blocked" : "unblocked"} successfully.`,
                data: doctor
            })
        } catch (error) {
            console.error(`Controller Error: ${error instanceof Error ? error.message : error}`);

            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error instanceof Error ? error.message : "An unexpected error occurred"
            })

        }
    }
   


   

}

export default AdminController;