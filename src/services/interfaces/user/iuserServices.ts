import { promises } from "dns";
import { IUser } from "../../../model/user/userModel";
import IUserRepository from "../../../repositories/interfaces/user/IUser";


export interface IUserService{

    registerBasicDetails(userDetails:Partial<IUser>):Promise<{ user: IUser}>

    sendOtp(token:string):Promise<{email: string; otp: string; message: string }>

    verifyOtp(userId: string, otp: string): Promise<string>;



    verifyToken(token:string):string;
    
}