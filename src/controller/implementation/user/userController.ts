import { Request, Response } from "express";
import IUserController from "../../interfaces/user/IUserController";
import IUserRepository from "../../../repositories/interfaces/user/IUser";
import UserRepository from "../../../repositories/implementation/user/userRepository";
import PasswordUtils from "../../../utils/passwordUtils"
import {sendOTPEmail} from "../../../utils/emailUtils"
import { IUserService } from "../../../services/interfaces/user/iuserServices";
import { json } from "body-parser";
class UserController implements IUserController{
    
    private userService:IUserService

    constructor(userService:IUserService){
        this.userService = userService
    }
   async registerBasicDetails(req: Request, res: Response): Promise<void> {
        try {

            const {user} = await this.userService.registerBasicDetails(req.body)
            
            res.status(201).json({ message: "OTP sent to email", email: user.email })

        } catch (error) {
            let errorMessage = "an unexpected error occured";
             if(error instanceof Error){
                errorMessage = error.message
             }
             res.status(400).json({error:errorMessage})
        }
    }




    sendOtp(req: Request, res: Response): Promise<Response> {
        throw new Error("Method not implemented.");
    }
    verifyOtp(req: Request, res: Response): Promise<Response> {
        throw new Error("Method not implemented.");
    }
    refreshToken(req: Request, res: Response): Promise<Response> {
        throw new Error("Method not implemented.");
    }


    
}

export default UserController



// const {fullName,email,password} = req.body;

// if(!fullName||!email||!password){
//     return res.status(400).json({message:"All fields are required"})
// }

// const existingUser = await this.userRepository.findUserByEmail(email)

// if(existingUser){
//     return res.status(400).json({message:"User already exists"})
// }

// const hashedPassword = await PasswordUtils.hashPassword(password)

// const otp = Math.floor(100000 +Math.random()*900000).toString()

// const otpExpires = new Date();
// otpExpires.setMinutes(otpExpires.getMinutes() + 5);


// //create user

// const newUser = await this.userRepository.createUser({
//     fullName,
//     email,
//     password:hashedPassword,
//     otp,
//     otpExpires,
//     status:0
// })


// // Send OTP Email
// await sendOTPEmail(email,otp)

// return res.status(201).json({message:"OTP sent to email", email })
