import { Request,Response } from "express";

interface IDoctorController{
    registerBasicDetails(req:Request,res:Response):Promise<void>;
    resendOtp(req:Request,res:Response):Promise<Response>
    verifyOtp(req:Request,res:Response):Promise<void>
    postLogin(req:Request,res:Response):Promise<void>
    renewAuthTokens(req:Request,res:Response):Promise<void>
    forgotPasswordDoctor(req:Request,res:Response):Promise<void>
    updatePasswordDoctor(req:Request,res:Response):Promise<void>
}


export default IDoctorController