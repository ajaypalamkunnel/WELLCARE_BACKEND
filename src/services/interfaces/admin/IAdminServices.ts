import { IAdmin } from "../../../model/admin/AdminModel"
import { IDoctor } from "../../../model/doctor/doctorModel";
import { IUser } from "../../../model/user/userModel";

export interface IAdminService{
   createAdmin(adminDetails: IAdmin): Promise<{ admin: IAdmin  | null}>;
   loginAdmin(email:string,password:string):Promise<{admin:IAdmin|null;accessTokenAdmin:string;refreshTokenAdmin:string}>
   fetchAllDoctors():Promise<IDoctor[]|null>
   getAllUsers(page: number, limit: number):Promise<{users:IUser[],totalUsers:number|null}>
  

}

 