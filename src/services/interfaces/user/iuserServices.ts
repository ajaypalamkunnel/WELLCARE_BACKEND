

import { IUser } from "../../../model/user/userModel";



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
}