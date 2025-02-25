import { IDoctor } from "../../../model/doctor/doctorModel";
import IDoctorRepository from "../../../repositories/interfaces/doctor/IDoctor";
import PasswordUtils from "../../../utils/passwordUtils";
import { IDoctorService } from "../../interfaces/doctor/iDoctorServices";
import { generteOTP } from "../../../utils/otpGenerator"
import { sendOTPEmail } from "../../../utils/emailUtils";
import JwtUtils from "../../../utils/jwtUtils";
import UserRepository from "../../../repositories/implementation/user/userRepository";


class DoctorService implements IDoctorService {

    private doctorRepository: IDoctorRepository

    constructor(userRepository: IDoctorRepository) {
        this.doctorRepository = userRepository
    }






    async registerBasicDetails(doctorDetails: Partial<IDoctor>): Promise<{ doctor: IDoctor; }> {

        const { fullName, email, password } = doctorDetails;

        if (!fullName || !email || !password) {
            throw new Error("All fields are required")
        }

        const existingUser = await this.doctorRepository.findDoctorByEmail(email!)
        console.log(existingUser);

        if (existingUser) {
            throw new Error("Email already Exist")
        }
        const hashedPassword = await PasswordUtils.hashPassword(password)

        const otp = generteOTP()
        const otpExpires = new Date()

        otpExpires.setMinutes(otpExpires.getMinutes() + 5)

        const doctor = await this.doctorRepository.createDoctor({
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
        const doctor = await this.doctorRepository.findDoctorByEmail(email)

        if (!doctor) {
            throw new Error("Doctor not found")
        }

        const otp = generteOTP()
        const otpExpires = new Date()
        otpExpires.setMinutes(otpExpires.getMinutes() + 10)

        await this.doctorRepository.updateDoctor(doctor._id.toString(), { otp, otpExpires })

        await sendOTPEmail(email, otp)
    }


    async verifyOtp(email: string, otp: string): Promise<void> {
        const doctor = await this.doctorRepository.findDoctorByEmail(email)
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

        await this.doctorRepository.updateDoctor(doctor._id.toString(), {
            otp: null,
            otpExpires: null,
            status: 1
        })

    }

    async loginDoctor(email: string, password: string): Promise<{ doctor: IDoctor | null; doctorAccessToken: string; doctorRefreshToken: string; }> {
        console.log("hi I am from login doctor");
        
        const doctor = await this.doctorRepository.findDoctorByEmail(email)
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

        const doctorAccessToken = JwtUtils.generateAccesToken({ doctorId: doctor._id, email: doctor.email })
        const doctorRefreshToken = JwtUtils.generateRefreshToken({ doctorId: doctor._id })

        await this.doctorRepository.updateDoctorRefreshToken(doctor._id.toString(), doctorRefreshToken)
        return { doctorAccessToken, doctorRefreshToken, doctor }
    }

    renewAuthToken(token: string): Promise<{ accessToken: string; refreshToken: string; }> {
        throw new Error("Method not implemented.");
    }


    async forgotPassword(email: string): Promise<void> {
        console.log("I am from forgotPassword of doctor");

        try {

            const doctor = await this.doctorRepository.findDoctorByEmail(email)

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
            await this.doctorRepository.updateDoctor(doctor._id.toString(), { otp, otpExpires })
            console.log(`Forgot password OTP sent to ${email}.`);
        } catch (error) {

            console.error("Error in forgotPassword service:", error)
            throw new Error(error instanceof Error ? error.message : "An unexpected error occurred.");
        }




    }
    async updatePasswordDoctor(email: string, newPassword: string): Promise<void> {

        try {

            const doctor = await this.doctorRepository.findDoctorByEmail(email)

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
            await this.doctorRepository.updateDoctor(doctor._id.toString(), { password: hashedPassword })


        } catch (error) {
            console.error("Error in forgot Password:", error);

            if (error instanceof Error) {
                throw new Error(error.message)
            } else {
                throw new Error("An unexpected error occurred while processing the forgot password request.");
            }

        }


    }

}

export default DoctorService