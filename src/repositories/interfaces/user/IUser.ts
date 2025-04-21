import {IUser} from '../../../model/user/userModel';
import { IScheduleResponse } from '../../../types/bookingTypes';
import { firstChatDTO } from '../../../types/chat';
import { IBaseRepository } from '../../base/IBaseRepository';

interface IUserRepository extends IBaseRepository<IUser>{
    
    findUserByEmail(email:string):Promise<IUser|null>
    updateRefreshToken(userId:string,refreshToken:string):Promise<IUser|null>
    removeRefreshToken(refreshToken:string):Promise<void>
    findUserDataById(userId:string):Promise<IUser|null>
    updateUserStatus(userId:string,status:number):Promise<IUser|null>
    updatePassword(userId:string,hashedPassword:string):Promise<boolean>
    updateUserDetails(email:string,updateData:Partial<IUser>):Promise<IUser|null>

    fetchDoctorDaySchedule(doctorId:string,date:Date):Promise<IScheduleResponse[]>
    getBasicUserInfoById(userId:string):Promise<firstChatDTO|null>

    findUserTokenById(userId:string):Promise<IUser|null>
    

}


export default IUserRepository