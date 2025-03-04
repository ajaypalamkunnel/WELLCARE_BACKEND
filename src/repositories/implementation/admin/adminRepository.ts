import Admin,{ IAdmin } from "../../../model/admin/AdminModel";
import Doctor, { IDoctor } from "../../../model/doctor/doctorModel";
import IAdminRepository from "../../interfaces/admin/IAdminRepository";


class AdminRepository implements IAdminRepository{
    
   async createAdmin(admin: Partial<IAdmin>): Promise<IAdmin> {
        const newAdmin = new Admin(admin)
        return await newAdmin.save()
    }
    async findAdminByEmail(email: string): Promise<IAdmin | null> {
        return await Admin.findOne({email})
    }
    async findAdminById(id: string): Promise<IDoctor | null> {
        return await Admin.findById(id)
    }
    async findAllDoctors(): Promise<IDoctor[] | null> {
        const doctors = await Doctor.find({});
        return doctors.length > 0 ? doctors : null;
    }

}

export default AdminRepository