import Admin,{ IAdmin } from "../../../model/admin/AdminModel";
import Doctor, { IDoctor } from "../../../model/doctor/doctorModel";
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
        const doctors = await Doctor.find({});
        return doctors.length > 0 ? doctors : null;
    }

}

export default AdminRepository