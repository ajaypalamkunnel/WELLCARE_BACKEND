import { Request,Response } from "express";

interface IDoctorController{
    registerBasicDetails(req:Request,res:Response):Promise<void>;
    resendOtp(req:Request,res:Response):Promise<Response>
    verifyOtp(req:Request,res:Response):Promise<void>
    postLogin(req:Request,res:Response):Promise<void>
    renewAuthTokens(req:Request,res:Response):Promise<void>
    forgotPasswordDoctor(req:Request,res:Response):Promise<void>
    updatePasswordDoctor(req:Request,res:Response):Promise<void>
    googleAuthCallback(req: Request, res: Response): Promise<void> 
    logoutDoctor(req:Request,res:Response):Promise<void>
    getProfile(req:Request,res:Response):Promise<void>
    registerDoctor(req:Request,res:Response):Promise<void>
    updateDoctorStatus(req:Request,res:Response):Promise<void>
    verifyDoctor(req:Request,res:Response):Promise<void>
}


export default IDoctorController