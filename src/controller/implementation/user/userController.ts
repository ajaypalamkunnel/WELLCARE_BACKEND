import { Request, Response } from "express";
import IUserController from "../../interfaces/user/IUserController";
import IUserRepository from "../../../repositories/interfaces/user/IUser";
import UserRepository from "../../../repositories/implementation/user/userRepository";
import PasswordUtils from "../../../utils/passwordUtils"
import {sendOTPEmail} from "../../../utils/emailUtils"
import { IUserService } from "../../../services/interfaces/user/iuserServices";
import { json } from "body-parser";
import { error } from "console";
class UserController implements IUserController{
    
    private userService:IUserService

    constructor(userService:IUserService){
        this.userService = userService
    }
   async registerBasicDetails(req: Request, res: Response): Promise<void> {
    console.log("hello guys");
    
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


// resend OTP 
    async resendOtp(req: Request, res: Response): Promise<Response> {
        console.log("koiiiiii");
        
        try {
            const {email} = req.body
            if(!email){
                return res.status(400).json({success: false,error: "Email is required"})
            }
            await this.userService.resendOtp(email)
            return res.status(200).json({success:true,message:"New OTP sent to email"})
        } catch (error) {
            return res.status(400).json({success:false,error:error instanceof Error ? error.message : "An unexpected error occurred"})
        }
    }


    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const {email,otp} = req.body
            if(!email||!otp){
                res.status(400).json({error:"Email and OTP are required"})
                return 
            }

            await this.userService.verifyOtp(email,otp)

            res.status(200).json({message:"OTP verified successfully. Your account is now activated."})
        } catch (error) {
            res.status(400).json({error:error instanceof Error ? error.message : "OTP verification failed"})
        }
    }

    refreshToken(req: Request, res: Response): Promise<void> {
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
