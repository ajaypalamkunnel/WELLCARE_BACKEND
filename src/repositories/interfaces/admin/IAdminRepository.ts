import { IAdmin } from "../../../model/admin/AdminModel";
import { IDoctor } from "../../../model/doctor/doctorModel";
import { IUser } from "../../../model/user/userModel";
import { DoctorFilter } from "../../../types/bookingTypes";
import { IBaseRepository } from "../../base/IBaseRepository";

export default interface IAdminRepository extends IBaseRepository<IAdmin> {
    findAdminByEmail(email: string): Promise<IAdmin | null>;

    findAllDoctors(
        page: number,
        limit: number,
        searchTerm?: string,
        filters?: DoctorFilter
    ): Promise<{ data: IDoctor[]; total: number }>;
    getAllUsers(
        page: number,
        limit: number
    ): Promise<{ users: IUser[]; totalUsers?: number | null }>;

    udateDoctorStatus(doctorId: string, status: number): Promise<IDoctor | null>;
}
