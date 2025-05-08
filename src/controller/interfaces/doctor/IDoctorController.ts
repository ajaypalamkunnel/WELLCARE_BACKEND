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
    updateProfile(req: Request, res: Response): Promise<void>;
    changePassword(req:Request,res:Response):Promise<Response>
    getDoctors(req: Request, res: Response): Promise<Response>;
    getDoctorProfile(req:Request,res:Response):Promise<Response>
    getDoctorInfoForChat(req: Request, res: Response): Promise<Response>
    addEducation(req: Request, res: Response): Promise<Response>
    addCertification(req:Request,res:Response):Promise<Response>
    editEducation(req:Request,res:Response):Promise<Response>
    editCertification(req:Request,res:Response):Promise<Response>
    getWalletSummary(req:Request,res:Response):Promise<Response>
    witdraw(req:Request,res:Response):Promise<Response>
    listNotifications(req:Request,res:Response):Promise<Response>
}


export default IDoctorController