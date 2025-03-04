import e, { Request, Response } from "express";
import IDoctorController from "../../interfaces/doctor/IDoctorController";
import { IDoctorService } from "../../../services/interfaces/doctor/iDoctorServices";
import { error } from "console";


class DoctorController implements IDoctorController {

    private _doctorService: IDoctorService

    constructor(_doctorService: IDoctorService) {
        this._doctorService = _doctorService
    }
    
    
    
    
    async registerBasicDetails(req: Request, res: Response): Promise<void> {
        try {

            const { doctor } = await this._doctorService.registerBasicDetails(req.body)

            res.status(201).json({ message: "OTP sent to email", email: doctor.email })

        } catch (error) {
            let errorMessage = "an unexpected error occured";

            if (error instanceof Error) {
                errorMessage = error.message
            }
            res.status(400).json({ error: errorMessage })
        }
    }


    async resendOtp(req: Request, res: Response): Promise<Response> {
        try {
            const { email } = req.body

            if (!email) {
                return res.status(400).json({ success: true, error: "Email is required" })
            }
            await this._doctorService.resendOtp(email)
            return res.status(200).json({ success: true, message: "New OTP sent to email" })
        } catch (error) {
            return res.status(400).json({ success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" })
        }
    }
    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body

            if (!email || !otp) {
                res.status(400).json({ error: "Email and OTP are required" })
                return
            }
            await this._doctorService.verifyOtp(email, otp)
            res.status(200).json({ message: "OTP verified successfully, Your account is now activated." })
        } catch (error) {
            res.status(400).json({ error: error instanceof Error ? error.message : "OTP verification failed" })
        }
    }

    
    async postLogin(req: Request, res: Response): Promise<void> {
        
        try {
            const { email, password } = req.body
            console.log("Iam from controller of doctor",email);
            console.log("Iam from controller of doctor",password);

            if (!email || !password) {
                res.status(400).json({ error: "Email and password are required" })
                return
            }

            const { doctorAccessToken, doctorRefreshToken, doctor } = await this._doctorService.loginDoctor(email, password)
            console.log(doctorAccessToken,"===",doctorRefreshToken);
            
            res.cookie("doctorRefreshToken", doctorRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 100
            })


            res.cookie("doctorAccessToken", doctorAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 2 * 60 * 60 * 1000, // 2 hours
              });

            res.status(200).json({
                success: true,
                message: "Login successful",
                doctorAccessToken,
                doctor: { id: doctor?._id, email: doctor?.email, fullName: doctor?.fullName }
            })
        } catch (error) {
            res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" })
        }
    }


   async forgotPasswordDoctor(req: Request, res: Response): Promise<void> {
       
       try {
           const {email} = req.body
           console.log("Hi i am from forgotPasswordDoctor controller",email);
           
        if(!email){
            res.status(400).json({success:false,error:"Email is required"})
            return
        }

        await this._doctorService.forgotPassword(email)
        res.status(200).json({success:true,message:"New OTP sent to email"})
        
       } catch (error) {
        console.error("Error in forgotPassword controller:", error);
        res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : "An unexpected error occurred" 
        });
        
        
       }
    }
    async updatePasswordDoctor(req: Request, res: Response): Promise<void> {
        try {

            const {email,password} = req.body

            if(!email){
                res.status(400).json({success:false,error:"Email is required"})
           }

           await this._doctorService.updatePasswordDoctor(email,password)
           res.status(200).json({success:true,error:"Password Updated Successfully"})
        } catch (error) {
            res.status(400).json({ success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" })
        }
    }

    
    renewAuthTokens(req: Request, res: Response): Promise<void> {
        throw new Error("Method not implemented.");
    }

   async googleAuthCallback(req: Request, res: Response): Promise<void> {
        try {
            
            const doctor = req.user;
            if (!doctor) {
                res.redirect(`${process.env.FRONTEND_URL}/login?error=AuthenticationFailed`);
                return;
            }
            const { accessToken, refreshToken } = await this._doctorService.generateTokens(doctor)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // res.status(200).json({
            //     success: true,
            //     message: "Google authentication successful",
            //     accessToken,
            //     doctor: { id: doctor._id, email: doctor.email, role: doctor.role },
            // });

            res.redirect(`${process.env.FRONTEND_URL}/auth-success?role=doctor`);

        } catch (error) {
            res.redirect(`${process.env.FRONTEND_URL}/login?error=InternalServerError`);
        }
    }


    async logoutDoctor(req: Request, res: Response): Promise<void> {

        try {

            const refreshToken = req.cookies.doctorRefreshToken

            // console.log("===>refersher",refreshToken);
            

            if(!refreshToken){
                res.status(400).json({error:"No refersh token provided"})
                return
            }

            await this._doctorService.logoutDoctor(refreshToken)
            

            res.clearCookie("doctorRefreshToken",{
                httpOnly:true,
                secure:process.env.NODE === "production",
                sameSite:true
            })

            res.cookie("doctorAccessToken", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                expires: new Date(0), // Expire the cookie immediately
              });

            res.status(200).json({success:true,message:"Logout successfull"})
        } catch (error) {
            res.status(500).json({error:"Logout failed"})
        }
        
    }

    async getProfile(req: Request, res: Response): Promise<void> {
        
        
        try {
            if(!req.user){
                res.status(401).json({error:"Unauthorized"})
                return 
            }
           

            const user = await this._doctorService.getDoctorProfile(req.user.userId);
            if(!user){
                res.status(404).json({error:"User not found"})
                
            }
            

            res.status(200).json({success:true,user})
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch user profile" });
        }
    }

}

export default DoctorController