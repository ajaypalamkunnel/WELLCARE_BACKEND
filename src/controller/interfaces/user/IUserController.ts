import { Request,Response } from "express";


interface UserController{
    registerBasicDetails(req:Request,res:Response):Promise<void>;
    sendOtp(req:Request,res:Response):Promise<Response>
    verifyOtp(req:Request,res:Response):Promise<Response>
    refreshToken(req:Request,res:Response):Promise<Response>
}

export default UserController