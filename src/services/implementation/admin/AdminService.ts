import { IAdmin } from "../../../model/admin/AdminModel";
import AdminRepository from "../../../repositories/implementation/admin/adminRepository";
import JwtUtils from "../../../utils/jwtUtils";
import PasswordUtils from "../../../utils/passwordUtils";
import { IAdminService } from "../../interfaces/admin/IAdminServices";
import { IDoctor } from "../../../model/doctor/doctorModel";
import { IUser } from "../../../model/user/userModel";
import DoctorRepository from "../../../repositories/implementation/doctor/doctorRepository";
import UserRepository from "../../../repositories/implementation/user/userRepository";
import { DoctorFilter } from "../../../types/bookingTypes";

export class AdminService implements IAdminService {
    private _adminRepository: AdminRepository;
    private _doctorRepository: DoctorRepository;
    private _userRepository: UserRepository;

    constructor(
        _adminRepository: AdminRepository,
        _doctorRepository: DoctorRepository,
        _userRepository: UserRepository
    ) {
        this._adminRepository = _adminRepository;
        this._doctorRepository = _doctorRepository;
        this._userRepository = _userRepository;
    }

    async createAdmin(
        adminDetails: Partial<IAdmin>
    ): Promise<{ admin: IAdmin | null }> {
        try {
            if (!adminDetails.email) {
                throw new Error("Email is required to create an admin.");
            }
            if (!adminDetails.password) {
                throw new Error("Password is required to create an admin.");
            }
            const email = adminDetails.email;
            const existingAdmin = await this._adminRepository.findAdminByEmail(email);
            if (existingAdmin) {
                console.warn(` Admin with email ${adminDetails.email} already exists.`);
                return { admin: null };
            }

            const password = adminDetails.password as string; // Ensure password is a string
            const hashedPassword = await PasswordUtils.hashPassword(password);

            const newAdmin = await this._adminRepository.create({
                email: adminDetails.email,
                password: hashedPassword,
            });

            return { admin: newAdmin };
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(" Error in createAdmin:", error.message);
            } else {
                console.error(" Unknown error in createAdmin:", error);
            }

            throw new Error("Failed to create admin user. Please try again.");
        }
    }

    async loginAdmin(
        email: string,
        password: string
    ): Promise<{
        admin: IAdmin | null;
        accessTokenAdmin: string;
        refreshTokenAdmin: string;
    }> {
        try {
            const admin = await this._adminRepository.findAdminByEmail(email);

            if (!admin) {
                throw new Error("Invalid email or password.");
            }

            const isMatch = await PasswordUtils.comparePassword(
                password,
                admin.password
            );

            if (!isMatch) {
                throw new Error("Invalid email or password.");
            }

            const accessTokenAdmin = JwtUtils.generateAccesToken({
                userId: admin._id,
                email: admin.email,
                role: "admin",
            });
            const refreshTokenAdmin = JwtUtils.generateRefreshToken({
                userId: admin._id,
            });
            return { admin, accessTokenAdmin, refreshTokenAdmin };
        } catch (error: unknown) {
            console.error("Error in adminservice loginAdmin: ", error);

            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("An unexpected error occurred during login.");
        }
    }

    async fetchAllDoctors(
        page: number,
        limit: number,
        searchTerm?: string,
        filters?: DoctorFilter
    ): Promise<{ data: IDoctor[]; total: number }> {
        try {
            const result = this._adminRepository.findAllDoctors(
                page,
                limit,
                searchTerm,
                filters
            );

            return result;
        } catch (error) {
            console.error("Error fetching doctors:", error);
            throw new Error("Failed to fetch doctors");
        }
    }

    async getAllUsers(
        page: number,
        limit: number,
        searchTerm?: string
    ): Promise<{ users: IUser[]; totalUsers: number | null }> {
        try {

            const result = await this._adminRepository.getAllUsers(
                page,
                limit,
                searchTerm
            );
          
            return {
                users: result.users,
                totalUsers: result.totalUsers ?? null,
            };
        } catch (error) {
            console.error(
                `Error in getAllUsers: ${error instanceof Error ? error.message : error
                }`
            );
            throw new Error("Failed to fetch users");
        }
    }

    async updateDoctorStatus(doctorId: string, status: number): Promise<IDoctor> {
        try {
            if (![1, -1].includes(status)) {
                throw new Error(
                    "Invalid status value. Use -1 for block, 1 for unblock."
                );
            }

            const existingDoctor = await this._doctorRepository.findById(doctorId);

            if (!existingDoctor) {
                throw new Error("Doctor not found");
            }

            const updatedDoctor = await this._adminRepository.udateDoctorStatus(
                doctorId,
                status
            );

            if (!updatedDoctor) {
                throw new Error("Failed to update doctor status");
            }
            return updatedDoctor;
        } catch (error) {
            console.error(
                `Error in updateDoctorStatus: ${error instanceof Error ? error.message : error
                }`
            );
            throw error;
        }
    }
}
