import Doctor, { IDoctor } from "../../../model/doctor/doctorModel";
import { BaseRepository } from "../../base/BaseRepository";
import IDoctorRepository from "../../interfaces/doctor/IDoctor";


class DoctorRepository extends BaseRepository<IDoctor> implements IDoctorRepository{
    

    constructor(){
        super(Doctor);
    }
    
    async findDoctorByEmail(email:string): Promise<IDoctor | null> {
        console.log(email);
        
        return await Doctor.findOne({email})
    }
    
    async updateDoctorRefreshToken(id: string, refreshToken: string): Promise<IDoctor | null> {
        return await Doctor.findByIdAndUpdate(id,{refreshToken});
    }

    async removeRefreshToken(refreshToken: string): Promise<void> {
        await Doctor.updateOne({refreshToken},{$unset:{refreshToken:1}})
    }
    

    async findUserDataById(userId: string): Promise<IDoctor | null> {
       return await Doctor.findById(userId).select("-password -refreshToken")
    }
}
export default DoctorRepository