import { IUser } from "../../../model/user/userModel";
import IUserRepository from "../../../repositories/interfaces/user/IUser";
import PasswordUtils from "../../../utils/passwordUtils";
import { IUserService } from "../../interfaces/user/iuserServices";
import { sendOTPEmail } from "../../../utils/emailUtils";
import { userInfo } from "os";
import JwtUtils from "../../../utils/jwtUtils";

class UserService implements IUserService {

    private userRepository: IUserRepository


    constructor(userRespository: IUserRepository) {
        this.userRepository = userRespository
    }
    

    //Genereate jwt

    // private generateToken(userId:string):string{

    // }

    private generteOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }



    async registerBasicDetails(userDetails: Partial<IUser>): Promise<{ user: IUser }> {

        const { fullName, email, password } = userDetails;


        if (!fullName || !email || !password) {
            throw new Error("All fields are required")
        }


        const existingUser = await this.userRepository.findUserByEmail(userDetails.email!)

        if (existingUser) {
            throw new Error("Email already Exist")
        }

        const hashedPassword = await PasswordUtils.hashPassword(password)

        //Generate OTP 

        const otp = this.generteOTP()
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 5); // 5 minutes expiry

        const user = await this.userRepository.createUser({
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
        const user = await this.userRepository.findUserByEmail(email)

        if (!user) {
            throw new Error("User not found")
        }

        const otp = this.generteOTP()
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 10);

        await this.userRepository.updateUser(user._id.toString(), { otp, otpExpires })

        await sendOTPEmail(email, otp)


    }


    async verifyOtp(email: string, otp: string): Promise<void> {
        const user =  await this.userRepository.findUserByEmail(email)

        if(!user){
            throw new Error("User not found");
        }

        if(!user.otp || !user.otpExpires || new Date() > user.otpExpires){
            throw new Error("OTP expired. Please request a new one.")
        }

        if(user.otp !== otp){
            throw new Error("Invalid OTP. Pleae try again")
        }

        await this.userRepository.updateUser(user._id.toString(),{
            otp:null,
            otpExpires:null,
            status:1  
        })
    }



    async loginUser(email: string, password: string): Promise<{ user: IUser | null; accessToken:string;refreshToken:string }> {
        

        const user = await this.userRepository.findUserByEmail(email)

        if(!user){
            throw new Error("Invalid email or password.")
        }

        if(user.status === -1){
            throw new Error("This user is blocked by admin")
        }

        const isMatch = await PasswordUtils.comparePassword(password,user.password)


        if(!isMatch){
            throw new Error("Invalid email or password.")
        }

        const accessToken = JwtUtils.generateAccesToken({userId:user._id,email:user.email})
        const refreshToken = JwtUtils.generateRefreshToken({userId:user._id})

        await this.userRepository.updateRefreshToken(user._id.toString(),refreshToken)
        return {accessToken,refreshToken,user}
    }



    // token renewl using this method
    async renewAuthTokens(oldRefreshToken: string): Promise<{accessToken: string; refreshToken: string}> {

        const decode = JwtUtils.verifyToken(oldRefreshToken,true)

        if(!decode || typeof decode === 'string' || !decode.userId){
            throw new Error("Invalid refresh token");
        }

        const user = await this.userRepository.findUserByEmail(decode.userId);
        if(!user || user.refreshToken !== oldRefreshToken){
            throw new Error("Invalid refresh token")
        }

        const newAccessToken = JwtUtils.generateAccesToken({userId:user._id,email:user.email})
        const newRefreshToken = JwtUtils.generateRefreshToken({ userId: user._id })

        return {accessToken:newAccessToken,refreshToken:newRefreshToken}
        
    }


}

export default UserService



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
