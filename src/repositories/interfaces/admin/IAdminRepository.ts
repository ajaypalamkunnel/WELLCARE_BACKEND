import AdminModel,{IAdmin} from "../../../model/admin/AdminModel";
import { IDoctor } from "../../../model/doctor/doctorModel";
import { IUser } from "../../../model/user/userModel";
import { IBaseRepository } from "../../base/IBaseRepository";

export default interface IAdminRepository extends IBaseRepository<IAdmin>{
    
    findAdminByEmail(email:string):Promise<IAdmin|null>
    
    findAllDoctors():Promise<IDoctor[]|null>
    getAllUsers(page:number,limit:number):Promise<{users:IUser[],totalUsers?:number | null}>
    

    
}