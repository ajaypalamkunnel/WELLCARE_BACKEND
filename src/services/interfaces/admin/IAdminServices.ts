import { IAdmin } from "../../../model/admin/AdminModel"

export interface IAdminService{
   createAdmin(adminDetails: IAdmin): Promise<{ admin: IAdmin  | null}>;
   loginAdmin(email:string,password:string):Promise<{admin:IAdmin|null;accessTokenAdmin:string;refreshTokenAdmin:string}>
   

}

 