import {
    ICertification,
    IDoctor,
    IEducation,
} from "../../../model/doctor/doctorModel";
import IDoctorRepository from "../../../repositories/interfaces/doctor/IDoctor";
import PasswordUtils from "../../../utils/passwordUtils";
import { IDoctorService } from "../../interfaces/doctor/iDoctorServices";
import { generteOTP } from "../../../utils/otpGenerator";
import {
    sendApplicationApprovalEmail,
    sendApplicationRejectionEmail,
    sendOTPEmail,
} from "../../../utils/emailUtils";
import JwtUtils from "../../../utils/jwtUtils";
import { CustomError } from "../../../utils/CustomError";
import mongoose, { FilterQuery } from "mongoose";
import { StatusCode } from "../../../constants/statusCode";
import { firstChatDTO } from "../../../types/chat";
import { AddEducationDTO } from "../../../types/doctor";
import { INotification } from "../../../model/notification/notificationModel";
import { emit } from "process";
import { Roles } from "../../../types/roles";

class DoctorService implements IDoctorService {
    private _doctorRepository: IDoctorRepository;

    constructor(userRepository: IDoctorRepository) {
        this._doctorRepository = userRepository;
    }

    async registerBasicDetails(
        doctorDetails: Partial<IDoctor>
    ): Promise<{ doctor: IDoctor }> {
        const { fullName, email, password } = doctorDetails;

        if (!fullName || !email || !password) {
            throw new Error("All fields are required");
        }

        const existingUser = await this._doctorRepository.findDoctorByEmail(email!);

        if (existingUser) {
            throw new Error("Email already Exist");
        }
        const hashedPassword = await PasswordUtils.hashPassword(password);

        const otp = generteOTP();
        const otpExpires = new Date();

        otpExpires.setMinutes(otpExpires.getMinutes() + 5);

        const doctor = await this._doctorRepository.create({
            fullName,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            status: 0,
        });

        await sendOTPEmail(email, otp);

        return { doctor };
    }

    async resendOtp(email: string): Promise<void> {
        const doctor = await this._doctorRepository.findDoctorByEmail(email);

        if (!doctor) {
            throw new Error("Doctor not found");
        }

        const otp = generteOTP();
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 10);

        await this._doctorRepository.update(doctor._id.toString(), {
            otp,
            otpExpires,
        });

        await sendOTPEmail(email, otp);
    }

    async verifyOtp(email: string, otp: string): Promise<void> {
        const doctor = await this._doctorRepository.findDoctorByEmail(email);

        if (!doctor) {
            throw new Error("Doctor not found");
        }

        if (!doctor.otp || !doctor.otpExpires || new Date() > doctor.otpExpires) {
            throw new Error("Invalid OTP. Pleae try again");
        }

        if (doctor.otp !== otp) {
            throw new Error("Invalid OTP. Please try again");
        }

        await this._doctorRepository.update(doctor._id.toString(), {
            otp: null,
            otpExpires: null,
            status: 1,
        });
    }

    async loginDoctor(
        email: string,
        password: string
    ): Promise<{
        doctor: IDoctor | null;
        doctorAccessToken: string;
        doctorRefreshToken: string;
    }> {
        const doctor = await this._doctorRepository.findDoctorByEmail(email);

        if (!doctor) {
            throw new Error("Invalid email or Password");
        }

        if (doctor.status === -1) {
            throw new Error("This doctor is blocked by admin");
        }

        const isMatch = await PasswordUtils.comparePassword(
            password,
            doctor.password
        );

        if (!isMatch) {
            throw new Error("Invalid email or Password");
        }

        const doctorAccessToken = JwtUtils.generateAccesToken({
            userId: doctor._id,
            email: doctor.email,
            role: "doctor",
        });
        const doctorRefreshToken = JwtUtils.generateRefreshToken({
            userId: doctor._id,
        });

        await this._doctorRepository.updateDoctorRefreshToken(
            doctor._id.toString(),
            doctorRefreshToken
        );
        return { doctorAccessToken, doctorRefreshToken, doctor };
    }

    async renewAuthToken(
        token: string
    ): Promise<{ accessToken: string }> {
        const decode = JwtUtils.verifyToken(token,true)

       

        if(!decode || typeof decode === "string" || !decode.userId){
            throw new Error("Invalid refresh token")
        }

        const doctor = await this._doctorRepository.findDoctorTokenById(
            decode.userId.toString()
        )

       
        

        if(!doctor || doctor.refreshToken !== token){
            throw new Error("Invalid refresh token");
        }

        const newAccessToken = JwtUtils.generateAccesToken({
            userId:doctor._id,
            emit:doctor.email,
            role:"doctor"
        })

        console.log("new acces token from service : ",newAccessToken);
        

        return {accessToken:newAccessToken}


    }

    async forgotPassword(email: string): Promise<void> {
        try {
            const doctor = await this._doctorRepository.findDoctorByEmail(email);

            if (!doctor) {
                throw new Error("User with this email does not exist.");
            }

            if (doctor.status === -1) {
                throw new Error("This user is blocked by admin");
            }
            if (doctor.status === 0) {
                throw new Error("Signup is not completed");
            }

            const otp = generteOTP();
            const otpExpires = new Date();
            otpExpires.setMinutes(otpExpires.getMinutes() + 10);

            try {
                await sendOTPEmail(email, otp);
            } catch (emailError) {
               
                throw new Error(`Failed to send OTP email. Please try again. ${emailError}`);
            }
            await this._doctorRepository.update(doctor._id.toString(), {
                otp,
                otpExpires,
            });
        } catch (error) {
            if (error instanceof Error) {
                throw error
            } else {
                throw new Error(
                    error instanceof Error ? error.message : "An unexpected error occurred."
                );

            }
        }
    }
    async updatePasswordDoctor(
        email: string,
        newPassword: string
    ): Promise<void> {
        try {
            const doctor = await this._doctorRepository.findDoctorByEmail(email);

            if (!doctor) {
                throw new Error("User with this email does not exist.");
            }

            if (doctor.status === -1) {
                throw new Error("This user is blocked by admin");
            }
            if (doctor.status === 0) {
                throw new Error("Signup is not completed");
            }

            const hashedPassword = await PasswordUtils.hashPassword(newPassword);
            await this._doctorRepository.update(doctor._id.toString(), {
                password: hashedPassword,
            });
        } catch (error) {

            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error(
                    "An unexpected error occurred while processing the forgot password request."
                );
            }
        }
    }

    async findOrCreateUser(
        email: string,
        name: string,
        avatar: string,
        role: string // eslint-disable-line @typescript-eslint/no-unused-vars
    ): Promise<IDoctor | null> {
        let doctor = await this._doctorRepository.findDoctorByEmail(email);

        if (!doctor) {
            doctor = await this._doctorRepository.create({
                fullName: name,
                email,
                profileImage: avatar,
                password: email,
                isVerified: false,
                status: 1,
                refreshToken: "",
            });
            return doctor;
        }
        return doctor;
    }
    async generateTokens(
        user: Partial<IDoctor>
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const accessToken = JwtUtils.generateAccesToken({
            userId: user._id,
            email: user.email,
        });
        const refreshToken = JwtUtils.generateRefreshToken({ userId: user._id });

        return { accessToken, refreshToken };
    }

    // Find doctor by ID
    async getDoctorById(id: string): Promise<IDoctor | null> {
        return await this._doctorRepository.findById(id);
    }

    async logoutDoctor(refreshToken: string): Promise<void> {
        await this._doctorRepository.removeRefreshToken(refreshToken);
    }

    async getDoctorProfile(userId: string): Promise<IDoctor | null> {
        return await this._doctorRepository.findUserDataById(userId);
    }

    async registerDoctor(
        doctorDetails: Partial<IDoctor>
    ): Promise<{ doctor: IDoctor }> {
        try {
            const {
                // fullName,
                email,
                mobile,
                departmentId,
                specialization,
                experience,
                gender,
                licenseNumber,
                availability,
                clinicAddress,
                profileImage,
                licenseDocument,
                IDProofDocument,
                education,
                certifications,
            } = doctorDetails;

            const existingDoctor = await this._doctorRepository.findDoctorByEmail(
                email!
            );

            if (!existingDoctor) {
                throw new Error("Doctor not found");
            }
            const doctor_id = existingDoctor._id.toString();
            const updatedDoctor = await this._doctorRepository.update(doctor_id, {
                mobile,
                departmentId,
                specialization,
                experience,
                gender,
                licenseNumber,
                availability,
                clinicAddress,
                profileImage,
                licenseDocument,
                IDProofDocument,
                education,
                certifications,
                isVerified: false,
                status: 2,
            });

            return { doctor: updatedDoctor! };
        } catch (error) {
            console.error("Error in registerDoctorService:", error);
            throw new Error("Failed to register doctor. Please try again.");
        }
    }

    async updateDoctorStatus(doctorId: string, status: number): Promise<IDoctor> {
        try {
            if (![1, -1].includes(status)) {
                throw new Error(
                    "Invalid status value. Use -1 for block, 1 for unblock."
                );
            }

            const existingDoctor = await this._doctorRepository.findById(doctorId);

            if (!existingDoctor) {
                throw new Error("Doctor not found");
            }

            const updatedDoctor = await this._doctorRepository.udateDoctorStatus(
                doctorId,
                status
            );

            if (!updatedDoctor) {
                throw new Error("Failed to update doctor status");
            }
            return updatedDoctor;
        } catch (error) {
            console.error(
                `Error in updateDoctorStatus: ${error instanceof Error ? error.message : error
                }`
            );
            throw error;
        }
    }

    async verifyDoctor(
        doctorId: string,
        isVerified: boolean,
        reason: string
    ): Promise<IDoctor> {

        
        

        try {
            const existingDoctor = await this._doctorRepository.findById(doctorId);

            if (!existingDoctor) {
                throw new Error("Doctor not found");
            }
            let updatedDoctor;
            if (isVerified) {
                updatedDoctor = await this._doctorRepository.updateDoctorVerification(
                    doctorId,
                    isVerified,
                    1
                );
                if(!updatedDoctor?.email){
                    throw new Error("updated doctor email not found")
                }
                sendApplicationApprovalEmail(updatedDoctor.email!);
            } else {
                updatedDoctor = await this._doctorRepository.updateDoctorVerification(
                    doctorId,
                    isVerified,
                    -2
                );
                if(!updatedDoctor?.email){
                    throw new Error("updated doctor email not found")
                }

                let updatedRes = await this._doctorRepository.update(doctorId,{rejectReason:reason})



                sendApplicationRejectionEmail(updatedDoctor.email!, reason);
            }

            if (!updatedDoctor) {
                throw new Error("Failed to update doctor verification");
            }

            return updatedDoctor;
        } catch (error) {
            console.error(
                `Error in verifyDoctor: ${error instanceof Error ? error.message : error
                }`
            );
            throw error;
        }
    }

    async updateDoctorProfile(
        doctorId: string,
        updateData: Partial<IDoctor>
    ): Promise<IDoctor | null> {
        try {
            const allowedUpdates = [
                "fullName",
                "mobile",
                "experience",
                "specialization",
                "profileImage",
            ];

            const filteredUpdates: Partial<IDoctor> = {};

            for (const key of Object.keys(updateData)) {
                if (allowedUpdates.includes(key)) {
                    filteredUpdates[key as keyof IDoctor] =
                        updateData[key as keyof IDoctor];
                }
            }

            if (Object.keys(filteredUpdates).length === 0) {
                throw new Error("No valid fields provided for update.");
            }

            const updatedDoctor = await this._doctorRepository.update(
                doctorId,
                filteredUpdates
            );

            return updatedDoctor;
        } catch (error) {
            console.error("Error in updateDoctorProfile:", error);
            throw new Error("Failed to update doctor profile.");
        }
    }

    // async changePassword(doctorId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    //         }

    async changePassword(
        doctorId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<{ success: true; message: string }> {
        try {
            const user = await this._doctorRepository.findById(doctorId);

            if (!user) {
                throw new CustomError("User not found", 404);
            }

            const isMatch = await PasswordUtils.comparePassword(
                currentPassword,
                user.password
            );

            if (!isMatch) {
                throw new CustomError("Incorrect current password", 400);
            }

            const isSamePassword = await PasswordUtils.comparePassword(
                newPassword,
                user.password
            );
            if (isSamePassword) {
                throw new CustomError(
                    "New password must be different from the old password",
                    400
                );
            }

            const hashedPassword = await PasswordUtils.hashPassword(newPassword);

            const updated = await this._doctorRepository.updatePassword(
                doctorId,
                hashedPassword
            );

            if (!updated) {
                throw new CustomError("Failed to update password", 500);
            }

            return { success: true, message: "Password updated successfully" };
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }

            throw new CustomError("Internal Server Error", 500);
        }
    }

    async getFilteredDoctors(
        search?: string,
        departmentId?: string,
        experience?: { min?: number; max?: number },
        gender?: string,
        availability?: string,
        sortBy?: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ doctors: IDoctor[]; total: number; totalPages: number }> {
        try {
            const filters: FilterQuery<IDoctor> = { isSubscribed: true };

            if (search) {
                filters.fullName = { $regex: search, $options: "i" };
            }

            if (departmentId) {
                filters.departmentId = new mongoose.Types.ObjectId(departmentId);
            }

            if (
                experience &&
                (experience.min !== undefined || experience.max !== undefined)
            ) {
                filters.experience = {};
                if (experience.min !== undefined)
                    filters.experience.$gte = experience.min;
                if (experience.max !== undefined)
                    filters.experience.$lte = experience.max;
            }

            if (gender) {
                filters.gender = { $regex: `^${gender}$`, $options: "i" }; // Case-insensitive regex match
            }
            if (availability) {
                filters.availability = availability;
            }

            const sortOption: Record<string, 1 | -1> = {};
            if (sortBy === "experience") {
                sortOption.experience = -1;
            } else if (sortBy === "rating") {
                sortOption["rating.averageRating"] = -1;
            } else {
                sortOption.createdAt = -1;
            }

            const { doctors, total } =
                await this._doctorRepository.findDoctorsWithFilters(
                    filters,
                    sortOption,
                    page,
                    limit
                );

            return {
                doctors,
                total,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
           console.error("Failed to fetch doctors : ",error)
            throw new Error("Failed to fetch doctors");
        }
    }

    async detailedDoctorProfile(
        doctorId: string
    ): Promise<Partial<IDoctor | null>> {
        try {
            const doctor = await this._doctorRepository.getDoctorProfile(doctorId);

            if (!doctor) {
                throw new CustomError("doctor not found", StatusCode.NOT_FOUND);
            }

            return doctor;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }

            throw new CustomError(
                "Internal server error",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getDoctorChatInfo(doctorId: string): Promise<firstChatDTO> {
        try {
            const doctor = await this._doctorRepository.getBasicDoctorInfoById(
                doctorId
            );

            if (!doctor) {
                throw new CustomError("Doctor not found", StatusCode.NOT_FOUND);
            }

            return doctor;
        } catch (error) {
            throw error instanceof CustomError
                ? error
                : new CustomError(
                    "Failed to fetch doctor info",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
        }
    }

    async addEducation(
        doctorId: string,
        data: AddEducationDTO
    ): Promise<IEducation[]> {
        try {
            const { degree, institution, yearOfCompletion } = data;

            if (!degree || !institution || !yearOfCompletion || !doctorId) {
                throw new CustomError(
                    "All fields are required",
                    StatusCode.BAD_REQUEST
                );
            }

            const updatedEducation = await this._doctorRepository.addEducation(
                doctorId,
                data
            );

            if (!updatedEducation.length) {
                throw new CustomError(
                    "Failed to add education",
                    StatusCode.BAD_REQUEST
                );
            }

            return updatedEducation;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                throw new CustomError(
                    "Internal server error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async addCertification(
        doctorId: string,
        data: ICertification
    ): Promise<ICertification> {
        try {
            const { name, issuedBy, yearOfIssue } = data;

            if (!doctorId || !name || !issuedBy || !yearOfIssue) {
                throw new CustomError(
                    "All fields are required",
                    StatusCode.BAD_REQUEST
                );
            }

            const addedCertification = await this._doctorRepository.addCertification(
                doctorId,
                data
            );

            if (!addedCertification) {
                throw new CustomError(
                    "Failed to add certificate",
                    StatusCode.BAD_REQUEST
                );
            }

            return addedCertification;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                throw new CustomError(
                    "Internal server Error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async updateEducation(
        doctorId: string,
        data: IEducation
    ): Promise<IEducation> {
        try {
            const { _id, degree, institution, yearOfCompletion } = data;

            if (!_id || !degree || !institution || !yearOfCompletion || !doctorId) {
                throw new CustomError("all field required", StatusCode.BAD_REQUEST);
            }

            const result = this._doctorRepository.editEducation(doctorId, data);

            if (!result) {
                throw new CustomError(
                    "education updation failed",
                    StatusCode.BAD_REQUEST
                );
            }

            return result;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                throw new CustomError(
                    "Internal server error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async updateCertification(
        doctorId: string,
        data: ICertification
    ): Promise<ICertification> {
        try {
            const { _id, name, issuedBy, yearOfIssue } = data;

            if (!doctorId || !_id || !name || !issuedBy || !yearOfIssue) {
                throw new CustomError(
                    "All fields are required",
                    StatusCode.BAD_REQUEST
                );
            }

            const result = await this._doctorRepository.editCertification(
                doctorId,
                data
            );

            if (!result) {
                throw new CustomError(
                    "certification updation failed",
                    StatusCode.BAD_REQUEST
                );
            }

            return result;
        } catch (error) {
           

            if (error instanceof CustomError) {
                throw error;
            } else {
                throw new CustomError(
                    "Interanl server error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async fetchNotifications(userId: string): Promise<INotification[]> {
        try {
            const notifications = await this._doctorRepository.getAllNotifications(
                userId
            );

            return notifications;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError(
                    "Internal server error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
}

export default DoctorService;
