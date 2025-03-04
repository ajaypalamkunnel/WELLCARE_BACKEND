import { IDoctor } from "../../../model/doctor/doctorModel";
import IDoctorRepository from "../../../repositories/interfaces/doctor/IDoctor";
import PasswordUtils from "../../../utils/passwordUtils";
import { IDoctorService } from "../../interfaces/doctor/iDoctorServices";
import { generteOTP } from "../../../utils/otpGenerator"
import { sendOTPEmail } from "../../../utils/emailUtils";
import JwtUtils from "../../../utils/jwtUtils";
import UserRepository from "../../../repositories/implementation/user/userRepository";


class DoctorService implements IDoctorService {

    private _doctorRepository: IDoctorRepository

    constructor(userRepository: IDoctorRepository) {
        this._doctorRepository = userRepository
    }
    
    

    async registerBasicDetails(doctorDetails: Partial<IDoctor>): Promise<{ doctor: IDoctor; }> {

        const { fullName, email, password } = doctorDetails;

        if (!fullName || !email || !password) {
            throw new Error("All fields are required")
        }

        const existingUser = await this._doctorRepository.findDoctorByEmail(email!)
        console.log(existingUser);

        if (existingUser) {
            throw new Error("Email already Exist")
        }
        const hashedPassword = await PasswordUtils.hashPassword(password)

        const otp = generteOTP()
        const otpExpires = new Date()

        otpExpires.setMinutes(otpExpires.getMinutes() + 5)

        const doctor = await this._doctorRepository.createDoctor({
            fullName,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            status: 0

        })

        await sendOTPEmail(email, otp)
        console.log("create new user: ", doctor);

        return { doctor }
    }

    async resendOtp(email: string): Promise<void> {
        const doctor = await this._doctorRepository.findDoctorByEmail(email)

        if (!doctor) {
            throw new Error("Doctor not found")
        }

        const otp = generteOTP()
        const otpExpires = new Date()
        otpExpires.setMinutes(otpExpires.getMinutes() + 10)

        await this._doctorRepository.updateDoctor(doctor._id.toString(), { otp, otpExpires })

        await sendOTPEmail(email, otp)
    }


    async verifyOtp(email: string, otp: string): Promise<void> {
        const doctor = await this._doctorRepository.findDoctorByEmail(email)
        console.log(doctor);


        if (!doctor) {
            throw new Error("Doctor not found")
        }

        if (!doctor.otp || !doctor.otpExpires || new Date() > doctor.otpExpires) {
            throw new Error("Invalid OTP. Pleae try again")
        }

        if (doctor.otp !== otp) {
            throw new Error("Invalid OTP. Please try again")
        }

        await this._doctorRepository.updateDoctor(doctor._id.toString(), {
            otp: null,
            otpExpires: null,
            status: 1
        })

    }

    async loginDoctor(email: string, password: string): Promise<{ doctor: IDoctor | null; doctorAccessToken: string; doctorRefreshToken: string; }> {
        console.log("hi I am from login doctor");
        
        const doctor = await this._doctorRepository.findDoctorByEmail(email)
        console.log("hii ", doctor);

        if (!doctor) {
            throw new Error("Invalid email or Password")
        }

        if (doctor.status === -1) {
            throw new Error("This doctor is blocked by admin")
        }

        const isMatch = await PasswordUtils.comparePassword(password, doctor.password)

        if (!isMatch) {
            throw new Error("Invalid email or Password")
        }

        const doctorAccessToken = JwtUtils.generateAccesToken({ userId: doctor._id, email: doctor.email })
        const doctorRefreshToken = JwtUtils.generateRefreshToken({ userId: doctor._id })

        await this._doctorRepository.updateDoctorRefreshToken(doctor._id.toString(), doctorRefreshToken)
        return { doctorAccessToken, doctorRefreshToken, doctor }
    }

    renewAuthToken(token: string): Promise<{ accessToken: string; refreshToken: string; }> {
        throw new Error("Method not implemented.");
    }


    async forgotPassword(email: string): Promise<void> {
        console.log("I am from forgotPassword of doctor");

        try {

            const doctor = await this._doctorRepository.findDoctorByEmail(email)

            if (!doctor) {
                throw new Error("User with this email does not exist.")
            }

            if (doctor.status === -1) {
                throw new Error("This user is blocked by admin")
            }
            if (doctor.status === 0) {
                throw new Error("Signup is not completed")
            }

            const otp = generteOTP()
            const otpExpires = new Date()
            otpExpires.setMinutes(otpExpires.getMinutes() + 10)

            try {
                await sendOTPEmail(email, otp)
            } catch (emailError) {
                console.error("Failed to send OTP email:", emailError);
                throw new Error("Failed to send OTP email. Please try again.");
            }
            await this._doctorRepository.updateDoctor(doctor._id.toString(), { otp, otpExpires })
            console.log(`Forgot password OTP sent to ${email}.`);
        } catch (error) {

            console.error("Error in forgotPassword service:", error)
            throw new Error(error instanceof Error ? error.message : "An unexpected error occurred.");
        }




    }
    async updatePasswordDoctor(email: string, newPassword: string): Promise<void> {

        try {

            const doctor = await this._doctorRepository.findDoctorByEmail(email)

            if (!doctor) {
                throw new Error("User with this email does not exist.")
            }

            if (doctor.status === -1) {
                throw new Error("This user is blocked by admin")
            }
            if (doctor.status === 0) {
                throw new Error("Signup is not completed")
            }

            const hashedPassword = await PasswordUtils.hashPassword(newPassword)
            await this._doctorRepository.updateDoctor(doctor._id.toString(), { password: hashedPassword })


        } catch (error) {
            console.error("Error in forgot Password:", error);

            if (error instanceof Error) {
                throw new Error(error.message)
            } else {
                throw new Error("An unexpected error occurred while processing the forgot password request.");
            }

        }


    }


    async findOrCreateUser(email: string, name: string, avatar: string, role: string): Promise<IDoctor | null> {
        let doctor = await this._doctorRepository.findDoctorByEmail(email)


        if(!doctor){
            console.log("hi iMa doctor");
            
            doctor = await this._doctorRepository.createDoctor({
                fullName:name,
                email,
                profileImage:avatar,
                password:email,
                isVerified:false,
                status:1,
                refreshToken:""
            });
            return doctor
        }
        return doctor
    }
    async generateTokens(user: Partial<IDoctor>): Promise<{ accessToken: string; refreshToken: string; }> {
        const accessToken = JwtUtils.generateAccesToken({ userId: user._id, email: user.email })
        const refreshToken = JwtUtils.generateRefreshToken({ userId: user._id })

        return {accessToken,refreshToken}
    }


    // Find doctor by ID
    async getDoctorById(id: string): Promise<IDoctor | null> {
        return await this._doctorRepository.findById(id);
    }


    async logoutDoctor(refreshToken: string): Promise<void> {
        await this._doctorRepository.removeRefreshToken(refreshToken)
    }


    async getDoctorProfile(userId: string): Promise<IDoctor | null> {
        console.log("I am from service",userId);
        
        return await this._doctorRepository.findUserDataById(userId)
    }
    

}

export default DoctorService