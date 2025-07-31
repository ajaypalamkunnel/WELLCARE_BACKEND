import { DoctorDTO } from "../../../dto/adminDto/doctor.dto";
import { UserDTO } from "../../../dto/adminDto/User.dto";
import { IAdmin } from "../../../model/admin/AdminModel";
import { IDoctor } from "../../../model/doctor/doctorModel";
import { IUser } from "../../../model/user/userModel";
import { DoctorFilter } from "../../../types/bookingTypes";

export interface IAdminService {
   createAdmin(adminDetails: IAdmin): Promise<{ admin: IAdmin | null }>;
   loginAdmin(
      email: string,
      password: string
   ): Promise<{
      admin: IAdmin | null;
      accessTokenAdmin: string;
      refreshTokenAdmin: string;
   }>;
   fetchAllDoctors(
      page: number,
      limit: number,
      searchTerm?: string,
      filters?: DoctorFilter
   ): Promise<{ data: DoctorDTO[]; total: number }>;
   getAllUsers(
      page: number,
      limit: number,
      searchTerm?: string
   ): Promise<{ users: UserDTO[]; totalUsers: number | null }>;
   updateDoctorStatus(doctorId: string, status: number): Promise<IDoctor>;

   
}
