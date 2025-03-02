import AdminModel,{IAdmin} from "../../../model/admin/AdminModel";
import { IDoctor } from "../../../model/doctor/doctorModel";

export default interface IAdminRepository{
    createAdmin(admin:Partial<IAdmin>):Promise<IAdmin>
    findAdminByEmail(email:string):Promise<IAdmin|null>
    findAdminById(id:string):Promise<IDoctor|null>
}