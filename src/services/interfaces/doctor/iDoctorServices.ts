
import { IDoctor } from "../../../model/doctor/doctorModel"

export interface IDoctorService{
    registerBasicDetails(doctorDetails:Partial<IDoctor>):Promise<{doctor:IDoctor}>
    resendOtp(email:string):Promise<void>
    verifyOtp(email: string, otp: string): Promise<void>;
    loginDoctor(email:string,password:string):Promise<{doctor:IDoctor|null;doctorAccessToken:string;doctorRefreshToken:string}>
    renewAuthToken(token:string):Promise<{accessToken:string;refreshToken:string  }>
    forgotPassword(email:string):Promise<void>
    updatePasswordDoctor(email:string,newPassword:string):Promise<void>
}