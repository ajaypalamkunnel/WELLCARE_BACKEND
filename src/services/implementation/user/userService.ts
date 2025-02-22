import { IUser } from "../../../model/user/userModel";
import IUserRepository from "../../../repositories/interfaces/user/IUser";
import PasswordUtils from "../../../utils/passwordUtils";
import { IUserService } from "../../interfaces/user/iuserServices";
import { sendOTPEmail } from "../../../utils/emailUtils";

class UserService implements IUserService {

    private userRepository: IUserRepository


    constructor(userRespository: IUserRepository) {
        this.userRepository = userRespository
    }


    //Genereate jwt

    // private generateToken(userId:string):string{

    // }



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

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
    sendOtp(token: string): Promise<{ email: string; otp: string; message: string; }> {
        throw new Error("Method not implemented.");
    }
    verifyOtp(userId: string, otp: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    verifyToken(token: string): string {
        throw new Error("Method not implemented.");
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
