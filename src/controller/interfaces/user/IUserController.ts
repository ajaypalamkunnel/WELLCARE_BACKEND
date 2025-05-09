import { Request,Response } from "express";


interface UserController{
    registerBasicDetails(req:Request,res:Response):Promise<void>;
    resendOtp(req:Request,res:Response):Promise<Response>
    verifyOtp(req:Request,res:Response):Promise<void>
    postLogin(req: Request, res: Response): Promise<void>;
    renewAuthTokens(req: Request, res: Response): Promise<void>;
    forgotPassword(req:Request,res:Response):Promise<void>
    updatePassword(req:Request,res:Response):Promise<void>
    googleAuthCallback(req: Request, res: Response): Promise<void>;
    logout(req:Request,res:Response):Promise<void>
    getProfile(req:Request,res:Response):Promise<void>
    UpdateUserStatus(req:Request,res:Response):Promise<void>
    changePassword(req:Request,res:Response):Promise<Response>
    completeUserRegistration(req:Request,res:Response):Promise<Response>
    getDoctorSchedules(req:Request,res:Response):Promise<Response>
    getUserInfoForChat(req: Request, res: Response): Promise<Response>
    getWalletSummary(req: Request, res: Response): Promise<Response>;
    getWalletTransactions(req: Request, res: Response): Promise<Response>;
    listNotifications(req:Request,res:Response):Promise<Response>
    downloadPrescription(req:Request,res:Response):Promise<void>
}
export default UserController