import { Request, Response } from 'express';
import IAdminController from '../../interfaces/admin/IAdminController'
import { IAdminService } from '../../../services/interfaces/admin/IAdminServices';

class AdminController implements IAdminController{

    private adminService:IAdminService

    constructor(adminService:IAdminService){
        this.adminService = adminService
    }



    async login(req: Request, res: Response): Promise<void> {


        try {

            const {email,password} = req.body;

            if(!email || !password){
                res.status(400).json({ error: "Email and password are required" })
                return 
            }
            
            const {accessTokenAdmin,refreshTokenAdmin,admin} = await  this.adminService.loginAdmin(email,password)

            res.cookie("refreshTokenAdmin",refreshTokenAdmin,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"strict",
                maxAge:7 * 24 * 60 * 60 * 1000
            })

            res.cookie("accessTokenAdmin", accessTokenAdmin, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 2 * 60 * 60 * 1000, // 2 hours
              });

            res.status(200).json({
                success:true,
                message:"Login successfull",
                accessTokenAdmin,
                admin:{id:admin?._id,email:admin?.email}
            })
        } catch (error:unknown) {
            res.status(400).json({error:error instanceof Error ? error.message : "Login failed"})
        }
        



    }

}

export default AdminController;