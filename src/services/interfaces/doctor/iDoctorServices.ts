import {
    ICertification,
    IDoctor,
    IEducation,
} from "../../../model/doctor/doctorModel";
import { INotification } from "../../../model/notification/notificationModel";
import { firstChatDTO } from "../../../types/chat";
import { AddEducationDTO } from "../../../types/doctor";

export interface IDoctorService {
    registerBasicDetails(
        doctorDetails: Partial<IDoctor>
    ): Promise<{ doctor: IDoctor }>;
    resendOtp(email: string): Promise<void>;
    verifyOtp(email: string, otp: string): Promise<void>;
    loginDoctor(
        email: string,
        password: string
    ): Promise<{
        doctor: IDoctor | null;
        doctorAccessToken: string;
        doctorRefreshToken: string;
    }>;
    renewAuthToken(
        token: string
    ): Promise<{ accessToken: string;}>;
    forgotPassword(email: string): Promise<void>;
    updatePasswordDoctor(email: string, newPassword: string): Promise<void>;

    findOrCreateUser(
        email: string,
        name: string,
        avatar: string,
        role: string
    ): Promise<IDoctor | null>;

    generateTokens(
        user: Express.User
    ): Promise<{ accessToken: string; refreshToken: string }>;

    getDoctorById(id: string): Promise<IDoctor | null>;

    logoutDoctor(refreshToken: string): Promise<void>;

    getDoctorProfile(userId: string): Promise<IDoctor | null>;

    registerDoctor(doctorDetails: Partial<IDoctor>): Promise<{ doctor: IDoctor }>;

    updateDoctorStatus(doctorId: string, status: number): Promise<IDoctor>;

    verifyDoctor(
        doctor_id: string,
        isVerified: boolean,
        reason?: string
    ): Promise<IDoctor>;

    updateDoctorProfile(
        doctorId: string,
        updateData: Partial<IDoctor>
    ): Promise<IDoctor | null>;

    changePassword(
        doctorId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<{ success: true; message: string }>;

    getFilteredDoctors(
        search?: string,
        department?: string,
        experience?: { min?: number; max?: number },
        gender?: string,
        availability?: string,
        sortBy?: string,
        page?: number,
        limit?: number
    ): Promise<{ doctors: IDoctor[]; total: number; totalPages: number }>;

    detailedDoctorProfile(doctorId: string): Promise<Partial<IDoctor | null>>;

    //
    getDoctorChatInfo(doctorId: string): Promise<firstChatDTO>;

    addEducation(doctorId: string, data: AddEducationDTO): Promise<IEducation[]>;

    addCertification(
        doctorId: string,
        data: ICertification
    ): Promise<ICertification>;

    updateEducation(educationId: string, data: IEducation): Promise<IEducation>;

    updateCertification(
        doctorId: string,
        data: ICertification
    ): Promise<ICertification>;

    fetchNotifications(userId: string): Promise<INotification[]>;

    getRegistrationData(doctorId:string):Promise<Partial<IDoctor|null>>
}
