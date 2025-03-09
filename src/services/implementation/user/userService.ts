import { IUser } from "../../../model/user/userModel";
import IUserRepository from "../../../repositories/interfaces/user/IUser";
import PasswordUtils from "../../../utils/passwordUtils";
import { IUserService } from "../../interfaces/user/iuserServices";
import { sendOTPEmail } from "../../../utils/emailUtils";
import { userInfo } from "os";
import JwtUtils from "../../../utils/jwtUtils";
import { generteOTP } from "../../../utils/otpGenerator"



class UserService implements IUserService {

    private _userRepository: IUserRepository


    constructor(userRespository: IUserRepository) {
        this._userRepository = userRespository
    }
    
    


    private generteOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }



    async registerBasicDetails(userDetails: Partial<IUser>): Promise<{ user: IUser }> {

        const { fullName, email, password } = userDetails;


        if (!fullName || !email || !password) {
            throw new Error("All fields are required")
        }


        const existingUser = await this._userRepository.findUserByEmail(userDetails.email!)

        if (existingUser) {
            throw new Error("Email already Exist")
        }

        const hashedPassword = await PasswordUtils.hashPassword(password)

        //Generate OTP 

        const otp = this.generteOTP()
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 5); // 5 minutes expiry

        const user = await this._userRepository.create({
            fullName,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            status: 0
        })

        await sendOTPEmail(email, otp)
        console.log("create new user: ", user);


        return { user }

    }

    async resendOtp(email: string): Promise<void> {
        const user = await this._userRepository.findUserByEmail(email)

        if (!user) {
            throw new Error("User not found")
        }

        const otp = this.generteOTP()
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 10);

        await this._userRepository.update(user._id.toString(), { otp, otpExpires })

        await sendOTPEmail(email, otp)


    }


    async verifyOtp(email: string, otp: string): Promise<void> {
        const user = await this._userRepository.findUserByEmail(email)

        if (!user) {
            throw new Error("User not found");
        }

        if (!user.otp || !user.otpExpires || new Date() > user.otpExpires) {
            throw new Error("OTP expired. Please request a new one.")
        }

        if (user.otp !== otp) {
            throw new Error("Invalid OTP. Please try again")
        }

        await this._userRepository.update(user._id.toString(), {
            otp: null,
            otpExpires: null,
            status: 1
        })
    }



    async loginUser(email: string, password: string): Promise<{ user: IUser | null; accessToken: string; refreshToken: string }> {


        const user = await this._userRepository.findUserByEmail(email)

        if (!user) {
            throw new Error("Invalid email or password.")
        }

        if (user.status === -1) {
            throw new Error("This user is blocked by admin")
        }
        if (user.status === 0) {
            throw new Error("Signup is not completed")
        }

        const isMatch = await PasswordUtils.comparePassword(password, user.password)


        if (!isMatch) {
            throw new Error("Invalid email or password.")
        }

        const accessToken = JwtUtils.generateAccesToken({ userId: user._id, email: user.email })
        const refreshToken = JwtUtils.generateRefreshToken({ userId: user._id })

        await this._userRepository.updateRefreshToken(user._id.toString(), refreshToken)
        return { accessToken, refreshToken, user }
    }



    // token renewl using this method
    async renewAuthTokens(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {

        const decode = JwtUtils.verifyToken(oldRefreshToken, true)

        if (!decode || typeof decode === 'string' || !decode.userId) {
            throw new Error("Invalid refresh token");
        }

        const user = await this._userRepository.findUserByEmail(decode.userId);
        if (!user || user.refreshToken !== oldRefreshToken) {
            throw new Error("Invalid refresh token")
        }

        const newAccessToken = JwtUtils.generateAccesToken({ userId: user._id, email: user.email })
        const newRefreshToken = JwtUtils.generateRefreshToken({ userId: user._id })

        return { accessToken: newAccessToken, refreshToken: newRefreshToken }

    }

    async forgotPassword(email: string): Promise<void> {
        console.log("I am from forgotPassword");
        
        console.log(email);
        
        try {
            const user = await this._userRepository.findUserByEmail(email)

            if (!user) {
                throw new Error("User with this email does not exist.")
            }
            if (user.status === -1) {
                throw new Error("This user is blocked by admin")
            }
            if (user.status === 0) {
                throw new Error("Signup is not completed")
            }

            const otp = generteOTP()
            const otpExpires = new Date()
            otpExpires.setMinutes(otpExpires.getMinutes() + 10)

            try {
                await sendOTPEmail(email, otp);
            } catch (emailError) {
                console.error("Failed to send OTP email:", emailError);
                throw new Error("Failed to send OTP email. Please try again.");
            }
    
            //Save OTP only if email was sent successfully
            await this._userRepository.update(user._id.toString(), { otp, otpExpires });
    
            console.log(`Forgot password OTP sent to ${email}.`);
            
        } catch (error) {
            console.error("Error in forgotPassword service:", error);

            throw new Error(error instanceof Error ? error.message : "An unexpected error occurred.");

        }



    }

    async updatePasswordUser(email: string, newPassword: string): Promise<void> {

        try {

            const user = await this._userRepository.findUserByEmail(email)

            if (!user) {
                throw new Error("User with this email does not exist.")
            }
            if (user.status === -1) {
                throw new Error("This user is blocked by admin")
            }
            if (user.status === 0) {
                throw new Error("Signup is not completed")
            }

            const hashedPassword = await PasswordUtils.hashPassword(newPassword)

            await this._userRepository.update(user._id.toString(),{password:hashedPassword})

            
        } catch (error) {
            console.error("Error in forgotPassword:", error);

            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unexpected error occurred while processing the forgot password request.");
            }
        }
        
    }


    async findOrCreateUser(email: string, name: string, avatar: string, role: string): Promise<IUser | null> {
        let user = await this._userRepository.findUserByEmail(email)

      
        
        if(!user){
            console.log("hi Ima patient")
            user = await this._userRepository.create({
                fullName:name,
                email,
                profileUrl:avatar,
                password:email,
                isVerified:false,
                status:1,
                refreshToken:""
            });
            return user
        }
        return user
    }
    
   async generateTokens(user: IUser): Promise<{ accessToken: string; refreshToken: string; }> {
        const accessToken = JwtUtils.generateAccesToken({ userId: user._id, email: user.email })
        const refreshToken = JwtUtils.generateRefreshToken({ userId: user._id })

        return {accessToken,refreshToken}
    }

    //for passport.js
    async getUserById(id: string): Promise<IUser | null> {
        return await this._userRepository.findById(id);
    }


    async logoutUser(refreshToken: string): Promise<void> {
        await this._userRepository.removeRefreshToken(refreshToken)
    }


    async getUserProfile(userId: string): Promise<IUser | null> {
        return await this._userRepository.findUserDataById(userId)
    }

    
    

}

export default UserService

