import { Request, Response } from "express";
import IUserController from "../../interfaces/user/IUserController";
import IUserRepository from "../../../repositories/interfaces/user/IUser";
import UserRepository from "../../../repositories/implementation/user/userRepository";
import PasswordUtils from "../../../utils/passwordUtils"
import { sendOTPEmail } from "../../../utils/emailUtils"
import { IUserService } from "../../../services/interfaces/user/iuserServices";
import { error } from "console";
import passport from "passport";
import { IUser } from "../../../model/user/userModel";
import { IUserType } from "../../../types/user";

class UserController implements IUserController {

    private userService: IUserService

    constructor(userService: IUserService) {
        this.userService = userService
    }
    
//---------------------------Basic registration -----------------------------------------------

async registerBasicDetails(req: Request, res: Response): Promise<void> {
    console.log("hello guys");
    
    try {
        
        const { user } = await this.userService.registerBasicDetails(req.body)

            res.status(201).json({ message: "OTP sent to email", email: user.email })

        } catch (error) {
            let errorMessage = "an unexpected error occured";
            if (error instanceof Error) {
                errorMessage = error.message
            }
            res.status(400).json({ error: errorMessage })
        }
    }
    
//--------------------------- resend OTP -----------------------------------------------


async resendOtp(req: Request, res: Response): Promise<Response> {
    console.log("koiiiiii");
    
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ success: false, error: "Email is required" })
        }
        await this.userService.resendOtp(email)
        return res.status(200).json({ success: true, message: "New OTP sent to email" })
    } catch (error) {
        return res.status(400).json({ success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" })
    }
}

//--------------------------- Verify OTP -----------------------------------------------

    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body
            if (!email || !otp) {
                res.status(400).json({ error: "Email and OTP are required" })
                return
            }

            await this.userService.verifyOtp(email, otp)

            res.status(200).json({ message: "OTP verified successfully. Your account is now activated." })
        } catch (error) {
            res.status(400).json({ error: error instanceof Error ? error.message : "OTP verification failed" })
        }
    }


    async postLogin(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                res.status(400).json({ error: "Email and password are required" })
                return
            }

            const { accessToken, refreshToken, user } = await this.userService.loginUser(email, password)
            // console.log("===>",accessToken);
            // console.log("===>",refreshToken);
            // **Set Refresh Token in HTTP-Only Cookie**

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000

            })

            res.cookie("auth_token", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 2 * 60 * 60 * 1000, // 2 hours
              });

    

            res.status(200).json({
                success: true,
                message: "Login succesful",
                accessToken,
                user: { id: user?._id, email: user?.email, fullName: user?.fullName }
            })
        } catch (error) {
            res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" })
        }
    }

    async renewAuthTokens(req: Request, res: Response): Promise<void> {
        try {
            const oldRefreshToken = req.cookies.refreshToken;


            if (!oldRefreshToken) {
                res.status(401).json({ error: "Refresh token not found" })
                return;
            }

            const { accessToken, refreshToken } = await this.userService.renewAuthTokens(oldRefreshToken)


            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })


            res.status(200).json({ accessToken })
        } catch (error) {
            res.status(400).json({ error: error instanceof Error ? error.message : "Failed to refresh token" });
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body

            if (!email) {
                res.status(400).json({ success: false, error: "Email is required" })
                return
            }
            await this.userService.forgotPassword(email)

            res.status(200).json({ success: true, message: "New OTP sent to email" })

        } catch (error) {
            console.error("Error in forgotPassword controller:", error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "An unexpected error occurred"
            });
        }
    }


    async updatePassword(req: Request, res: Response): Promise<void> {
        try {

            const { email, password } = req.body
            if (!email) {
                res.status(400).json({ success: false, error: "Email is required" })
            }

            await this.userService.updatePasswordUser(email, password)
            res.status(200).json({ success: true, error: "Password Updated Successfully" })

        } catch (error) {
            res.status(400).json({ success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" })
        }

    }


    async googleAuthCallback(req: Request, res: Response): Promise<void> {
        console.log("Iam googleAuthCallback");


        try {
            console.log("====>", req.user);

            const user = req.user;
            console.log("&&&&====>", user);
           
            if (!user) {
                res.redirect(`${process.env.FRONTEND_URL}/login?error=AuthenticationFailed`);
                return;
            }

            const { accessToken, refreshToken } = await this.userService.generateTokens(user);
            
            
            
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })



            res.cookie("auth_token", accessToken, {
                httpOnly: true, // Prevents client-side access
                secure: process.env.NODE_ENV === "production", // HTTPS only in production
                sameSite: "strict", // Prevents CSRF attacks
                maxAge: 2 * 60 * 60 * 1000, // 15 minutes (short-lived access token)
            });
            
            

            res.redirect(`${process.env.FRONTEND_URL}/auth-success?role=patient&user=${encodeURIComponent(JSON.stringify(user))}&accesstoken=${accessToken}`);

        } catch (error) {
            res.redirect(`${process.env.FRONTEND_URL}/login?error=InternalServerError`);
        }



    }


    googleAuth = passport.authenticate('google', {
        scope: ['email', 'profile'],
        prompt: 'select_account'
    });


    async logout(req: Request, res: Response): Promise<void> {

        try {
            const refreshToken = req.cookies.refreshToken

            if (!refreshToken) {
                res.status(400).json({ error: "No refresh token provided" })
                return
            }

            await this.userService.logoutUser(refreshToken)

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            })

            res.cookie("auth_token", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                expires: new Date(0), // Expire the cookie immediately
              });


            res.status(200).json({ success: true, message: "Logout successful" });
        } catch (error) {
            res.status(500).json({ error: "Logout failed" });
        }


    }

    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            if(!req.user){
                res.status(401).json({error:"Unauthorized"});
                return 
            }

            const user = await this.userService.getUserProfile(req.user.userId)
            if(!user){
                res.status(404).json({error:"User not found"})
            }

            res.status(200).json({success:true,user})
        } catch (error) {
            res.status(500).json({error:"Failed to featch user Profile"})
        }
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
