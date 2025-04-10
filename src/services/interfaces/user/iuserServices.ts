

import { IDepartment } from "../../../model/department/departmentModel";
import { IAddress, IUser } from "../../../model/user/userModel";
import { IScheduleResponse } from "../../../types/bookingTypes";



export interface IUserService{

    registerBasicDetails(userDetails:Partial<IUser>):Promise<{ user: IUser}>

    resendOtp(token:string):Promise<void>

    verifyOtp(email: string, otp: string): Promise<void>;

    loginUser(emial:string,password:string):Promise<{ user: IUser | null; accessToken:string;refreshToken:string}>

    renewAuthTokens(token:string):Promise<{accessToken: string; refreshToken: string}>;

    forgotPassword(email:string):Promise<void>

    updatePasswordUser(email:string,newPassword:string):Promise<void>

    findOrCreateUser(
        email: string,
        name: string,
        avatar: string,
        role: string
    ): Promise<IUser| null>;

    generateTokens(user: Express.User ): Promise<{ accessToken: string; refreshToken: string }>;

    logoutUser(refreshToken:string):Promise<void>

    getUserProfile(userId:string):Promise<IUser | null>
    updateUserStatus(userId:string,status:number):Promise<IUser|null>

    changePassword(userId:string,currentPassword:string,newPassword:string):Promise<{ success: true; message: string }>

    completeUserRegistration(email:string,mobile:string,personalInfo:Partial<IUser["personalInfo"]>,address:IAddress,fullName?:string,):Promise<IUser>


    fetchScheduleByDoctorAndDate(doctorId:string,date:string):Promise<IScheduleResponse[]>



}