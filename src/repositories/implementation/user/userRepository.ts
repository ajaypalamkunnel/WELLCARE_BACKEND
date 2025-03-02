import { User,IUser } from "../../../model/user/userModel";
import IUserRepository from "../../interfaces/user/IUser";

class UserRepository implements IUserRepository {
    
    
    async createUser(user: Partial<IUser>): Promise<IUser> {
        const newUser = new User(user)
        return await newUser.save()
    }
    async findUserByEmail(email: string): Promise<IUser | null> {
        // console.log("Iam from findUserByEmail==>",email);
        
       return await User.findOne({ email })
    }   
    async findUserById(id: string): Promise<IUser | null> {
        return await User.findById(id)
    }
    async updateUser(id: string, update: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id,update,{new:true})
    }
    async getAllUsers(): Promise<IUser[]> {
        return await User.find()
    }
    async deleteUser(id: string): Promise<IUser | null> {
        return await User.findByIdAndDelete(id)
    }
    async updateRefreshToken(userId:string,refreshToken:string):Promise<IUser|null>{
        return await User.findByIdAndUpdate(userId,{refreshToken})
    }

    async removeRefreshToken(refreshToken: string): Promise<void> {
         await User.updateOne({refreshToken},{$unset:{refreshToken:1}})
    }

    async findUserDataById(userId: string): Promise<IUser | null> {
        return await User.findById(userId).select("-password -refreshToken")
    }
}

export default UserRepository