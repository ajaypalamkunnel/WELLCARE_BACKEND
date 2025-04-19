import { promises } from "dns";
import { ICertification, IDoctor, IEducation } from "../../../model/doctor/doctorModel";
import { BaseRepository } from "../../base/BaseRepository";
import { IBaseRepository } from "../../base/IBaseRepository";
import { firstChatDTO } from "../../../types/chat";
import { AddEducationDTO } from "../../../types/doctor";
import { Certificate } from "tls";

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
    findDoctorByIdAndGetSubscriptionDetails(doctorId:string):Promise<IDoctor|null>
    getBasicDoctorInfoById(doctorId:string):Promise<firstChatDTO|null>
    addEducation(doctorId:string,education:AddEducationDTO):Promise<IEducation[]>
    addCertification(doctorId:string,certification:ICertification):Promise<ICertification>
    editEducation(doctorId:string,updateEducation:IEducation):Promise<IEducation>
    editCertification(doctorId:String,updateCertification:ICertification):Promise<ICertification>

}