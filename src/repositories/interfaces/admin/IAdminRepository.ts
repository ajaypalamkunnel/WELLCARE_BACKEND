import AdminModel,{IAdmin} from "../../../model/admin/AdminModel";
import { IDoctor } from "../../../model/doctor/doctorModel";
import { IBaseRepository } from "../../base/IBaseRepository";

export default interface IAdminRepository extends IBaseRepository<IAdmin>{
    
    findAdminByEmail(email:string):Promise<IAdmin|null>
    
    findAllDoctors():Promise<IDoctor[]|null>
    
}