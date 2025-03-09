import { User, IUser } from "../../../model/user/userModel";
import { BaseRepository } from "../../base/BaseRepository";
import IUserRepository from "../../interfaces/user/IUser";

class UserRepository extends BaseRepository<IUser> implements IUserRepository {

    constructor() {
        super(User)
    }
    

    async findUserByEmail(email: string): Promise<IUser | null> {
        // console.log("Iam from findUserByEmail==>",email);

        return await User.findOne({ email })
    }

    async updateRefreshToken(userId: string, refreshToken: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(userId, { refreshToken })
    }

    async removeRefreshToken(refreshToken: string): Promise<void> {
        await User.updateOne({ refreshToken }, { $unset: { refreshToken: 1 } })
    }

    async findUserDataById(userId: string): Promise<IUser | null> {
        return await User.findById(userId).select("-password -refreshToken")
    }

    async updateUserStatus(userId:string,status:number):Promise<IUser|null>{

        if(![1,-1].includes(status)){
            throw new Error("Invalid status value. Use -1 for block, 1 for unblock.")
        }

        return await User.findByIdAndUpdate(userId,{status},{new:true}).select("-password -refreshToken -otp -otpExpires")

    }

    

    

}

export default UserRepository