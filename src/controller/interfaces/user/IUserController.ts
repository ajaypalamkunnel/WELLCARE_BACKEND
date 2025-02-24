import { Request,Response } from "express";


interface UserController{
    registerBasicDetails(req:Request,res:Response):Promise<void>;
    resendOtp(req:Request,res:Response):Promise<Response>
    verifyOtp(req:Request,res:Response):Promise<void>
    postLogin(req: Request, res: Response): Promise<void>;
    renewAuthTokens(req: Request, res: Response): Promise<void>;
}
export default UserController