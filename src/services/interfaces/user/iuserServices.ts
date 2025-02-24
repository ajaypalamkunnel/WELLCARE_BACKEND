import { promises } from "dns";
import { IUser } from "../../../model/user/userModel";
import IUserRepository from "../../../repositories/interfaces/user/IUser";


export interface IUserService{

    registerBasicDetails(userDetails:Partial<IUser>):Promise<{ user: IUser}>

    resendOtp(token:string):Promise<void>

    verifyOtp(email: string, otp: string): Promise<void>;

    loginUser(emial:string,password:string):Promise<{ user: IUser | null; accessToken:string;refreshToken:string}>



    renewAuthTokens(token:string):Promise<{accessToken: string; refreshToken: string}>;
    
}