import Admin,{ IAdmin } from "../../../model/admin/AdminModel";
import Doctor, { IDoctor } from "../../../model/doctor/doctorModel";
import { IUser, User } from "../../../model/user/userModel";
import { BaseRepository } from "../../base/BaseRepository";
import IAdminRepository from "../../interfaces/admin/IAdminRepository";


class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository{

    constructor(){
        super(Admin)
    }
    
    
    
    async findAdminByEmail(email: string): Promise<IAdmin | null> {
        return await Admin.findOne({email})
    }
    
    async findAllDoctors(): Promise<IDoctor[] | null> {
        const doctors = await Doctor.find({}).populate({path:"departmentId",select:"name"})
        return doctors.length > 0 ? doctors : null;
    }
    
    async getAllUsers(page: number, limit: number): Promise<{ users: IUser[]; totalUsers?: number | null; }> {
        try {

                    const skip = (page - 1) * limit;
                    const users = await User.find()
                    .select("-password -refreshToken -otp -otpExpires")
                    .skip(skip)
                    .limit(limit)
                    .exec()
        
                    const totalUsers = await User.countDocuments()
        
                    return { users,  totalUsers}
                    
                } catch (error) {
                    console.error("Error fetching users:", error);
                    throw new Error("Error fetching users");
                }
    }
    

    
}

export default AdminRepository