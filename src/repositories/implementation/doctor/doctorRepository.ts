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
       return await Doctor.findById(userId).select("-password -refreshToken").populate({path:"departmentId",select:"name"})
    }


    async udateDoctorStatus(doctorId: string, status: number): Promise<IDoctor | null> {
        if(![1,-1].includes(status)){
            throw new Error("Invalid status value. Use -1 for block, 1 for unblock.");
        }

        return await Doctor.findByIdAndUpdate(doctorId, {status},{new:true}).select("-password -refreshToken")
    }

    async updateDoctorVerification(doctorId: string, isVerified: boolean,status?:number): Promise<IDoctor | null> {

        const updateFields: Partial<IDoctor> = { isVerified }; // Always update isVerified

        if (status !== undefined) {
            updateFields.status = status; // Only update status if provided
        }

        

        return await Doctor.findByIdAndUpdate(
            doctorId,
            updateFields,
            {new:true}
        ).select("-password -refreshToken")
    }

   
    
}


export default DoctorRepository