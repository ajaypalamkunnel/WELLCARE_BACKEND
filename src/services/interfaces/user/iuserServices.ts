import { promises } from "dns";
import { IUser } from "../../../model/user/userModel";
import IUserRepository from "../../../repositories/interfaces/user/IUser";


export interface IUserService{

    registerBasicDetails(userDetails:Partial<IUser>):Promise<{ user: IUser}>

    sendOtp(token:string):Promise<void>

    verifyOtp(email: string, otp: string): Promise<void>;



    verifyToken(token:string):string;
    
}