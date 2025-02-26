import Doctor, { IDoctor } from "../../../model/doctor/doctorModel";
import IDoctorRepository from "../../interfaces/doctor/IDoctor";


class DoctorRepository implements IDoctorRepository{
    
    async createDoctor(doctor: Partial<IDoctor>): Promise<IDoctor> {
        const newDoctor = new Doctor(doctor);
        return await newDoctor.save()
    }
    async findDoctorByEmail(email: Partial<IDoctor>): Promise<IDoctor | null> {
        console.log(email);
        
        return await Doctor.findOne({email})
    }
    async findById(id: string): Promise<IDoctor | null> {
        return await Doctor.findById(id)
    }
    async findAll(): Promise<IDoctor[]> {
        return await Doctor.find()
    }
    async updateDoctor(id: string, update: Partial<IDoctor>): Promise<IDoctor | null> {
        return await Doctor.findByIdAndUpdate(id,update,{new:true})
    }
    async deleteDoctor(id: string): Promise<IDoctor | null> {
        return await Doctor.findByIdAndDelete(id)
    }
    async updateDoctorRefreshToken(id: string, refreshToken: string): Promise<IDoctor | null> {
        return await Doctor.findByIdAndUpdate(id,{refreshToken});
    }
    
    
}
export default DoctorRepository