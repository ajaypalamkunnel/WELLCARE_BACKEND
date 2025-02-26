import { IDoctor } from "../../../model/doctor/doctorModel";

export default interface IDoctorRepository{
    createDoctor(doctor:Partial<IDoctor>):Promise<IDoctor>
    findDoctorByEmail(email:Partial<IDoctor>):Promise<IDoctor | null>
    findById(id: string): Promise<IDoctor | null>;
    findAll(): Promise<IDoctor[]>;
    updateDoctor(id: string, update: Partial<IDoctor>): Promise<IDoctor | null>;
    deleteDoctor(id: string): Promise<IDoctor | null>;
    updateDoctorRefreshToken(id:string,refreshToken:string):Promise<IDoctor|null>
}