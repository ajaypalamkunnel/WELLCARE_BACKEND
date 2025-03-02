import { userInfo } from "os";
import { IAdmin } from "../../../model/admin/AdminModel";
import AdminRepository from "../../../repositories/implementation/admin/adminRepository";
import JwtUtils from "../../../utils/jwtUtils";
import PasswordUtils from "../../../utils/passwordUtils";
import { IAdminService } from "../../interfaces/admin/IAdminServices";


export class AdminService implements IAdminService{

    private adminRepository:AdminRepository

    constructor(adminRepository:AdminRepository){
        this.adminRepository = adminRepository
    }
    

    async createAdmin(adminDetails: Partial<IAdmin>): Promise<{ admin: IAdmin | null }> {
        try {
            if (!adminDetails.email) {
                throw new Error("Email is required to create an admin.");
            }
            if (!adminDetails.password) {
                throw new Error("Password is required to create an admin.");
            }
            const email = adminDetails.email
            const existingAdmin = await this.adminRepository.findAdminByEmail(email);
            if (existingAdmin) {
                console.warn(` Admin with email ${adminDetails.email} already exists.`);
                return { admin: null };
            }

            const password = adminDetails.password as string; // Ensure password is a string
            const hashedPassword = await PasswordUtils.hashPassword(password);
            
            const newAdmin = await this.adminRepository.createAdmin({
                email: adminDetails.email,
                password: hashedPassword,
            });

            return { admin: newAdmin };
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(" Error in createAdmin:", error.message);
            } else {
                console.error(" Unknown error in createAdmin:", error);
            }

            throw new Error("Failed to create admin user. Please try again.");
        }
    }



    async loginAdmin(email: string, password: string): Promise<{ admin: IAdmin | null; accessTokenAdmin: string; refreshTokenAdmin: string }> {
       try {

        const admin = await this.adminRepository.findAdminByEmail(email)


        if(!admin){
            throw new Error("Invalid email or password.")
        }

        const isMatch = await PasswordUtils.comparePassword(password,admin.password)

        if(!isMatch){
            throw new Error("Invalid email or password.")
        }

        const accessTokenAdmin = JwtUtils.generateAccesToken({userId:admin._id,email:admin.email})
        const refreshTokenAdmin = JwtUtils.generateRefreshToken({userId:admin._id})
        return { admin, accessTokenAdmin, refreshTokenAdmin }
       } catch (error:unknown) {

        console.error("Error in adminservice loginAdmin: ",error);

        if(error instanceof Error){
            throw new Error(error.message)
        }
        throw new Error("An unexpected error occurred during login.")
        
        
       }
    }

    


    

}