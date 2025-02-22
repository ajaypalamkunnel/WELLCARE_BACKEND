import { Request,Response } from "express";


interface UserController{
    registerBasicDetails(req:Request,res:Response):Promise<void>;
    sendOtp(req:Request,res:Response):Promise<Response>
    verifyOtp(req:Request,res:Response):Promise<void>
    refreshToken(req:Request,res:Response):Promise<void>
}

export default UserController