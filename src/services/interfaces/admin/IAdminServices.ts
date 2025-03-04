import { IAdmin } from "../../../model/admin/AdminModel"
import { IDoctor } from "../../../model/doctor/doctorModel";

export interface IAdminService{
   createAdmin(adminDetails: IAdmin): Promise<{ admin: IAdmin  | null}>;
   loginAdmin(email:string,password:string):Promise<{admin:IAdmin|null;accessTokenAdmin:string;refreshTokenAdmin:string}>
   fetchAllDoctors():Promise<IDoctor[]|null>

}

 