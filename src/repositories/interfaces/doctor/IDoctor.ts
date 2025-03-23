import { promises } from "dns";
import { IDoctor } from "../../../model/doctor/doctorModel";
import { BaseRepository } from "../../base/BaseRepository";
import { IBaseRepository } from "../../base/IBaseRepository";

export default interface IDoctorRepository extends IBaseRepository<IDoctor> {
    findDoctorByEmail(email: string): Promise<IDoctor | null>
    updateDoctorRefreshToken(id: string, refreshToken: string): Promise<IDoctor | null>
    removeRefreshToken(refreshToken: string): Promise<void>
    findUserDataById(userId: string): Promise<IDoctor | null>
    udateDoctorStatus(doctorId:string,status:number):Promise<IDoctor|null>
    updateDoctorVerification(doctorId:string,isVerified:boolean,status?:number):Promise<IDoctor|null>
    updatePassword(userId:string,hashedPassword:string):Promise<boolean>
    findDoctorsWithFilters(filters:any,sortOption:any,page:number,limit:number):Promise<{doctors:IDoctor[];total:number}>
    getDoctorProfile(doctorId:string):Promise<IDoctor|null>

}