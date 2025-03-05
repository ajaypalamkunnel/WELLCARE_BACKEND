import {IUser} from '../../../model/user/userModel';
import { IBaseRepository } from '../../base/IBaseRepository';

interface IUserRepository extends IBaseRepository<IUser>{
    
    findUserByEmail(email:string):Promise<IUser|null>
    updateRefreshToken(userId:string,refreshToken:string):Promise<IUser|null>
    removeRefreshToken(refreshToken:string):Promise<void>
    findUserDataById(userId:string):Promise<IUser|null>
}


export default IUserRepository