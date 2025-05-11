import { log } from "winston";
import Admin, { IAdmin } from "../../../model/admin/AdminModel";
import Doctor, { IDoctor } from "../../../model/doctor/doctorModel";
import { IUser, User } from "../../../model/user/userModel";
import { DoctorFilter } from "../../../types/bookingTypes";
import { BaseRepository } from "../../base/BaseRepository";
import IAdminRepository from "../../interfaces/admin/IAdminRepository";
import { Query } from "mongoose";


class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository {

    constructor() {
        super(Admin)
    }




    async findAdminByEmail(email: string): Promise<IAdmin | null> {
        return await Admin.findOne({ email })
    }

    async findAllDoctors(page: number, limit: number, searchTerm?: string, filters?: DoctorFilter): Promise<{ data: IDoctor[], total: number }> {

        const query: any = {}

        if (searchTerm) {
            query.fullName = { $regex: searchTerm, $options: 'i' }
        }


        if (filters) {
            if (filters.isVerified !== undefined && filters.isVerified !== "") {
                query.isVerified = filters.isVerified === "true";
            }

            if (filters.status !== undefined && filters.status !== "") {
                query.status = parseInt(filters.status);
            }

            if (filters.availability && filters.availability !== "") {
                query.availability = { $in: filters.availability.split(",") };
            }

            if (filters.departmentId && filters.departmentId !== "") {
                query.departmentId = filters.departmentId;
            }

            if (filters.isSubscribed !== undefined && filters.isSubscribed !== "") {
                query.isSubscribed = filters.isSubscribed === "true";
            }

            if ((filters.minExp && filters.minExp !== "") || (filters.maxExp && filters.maxExp !== "")) {
                query.experience = {};
                if (filters.minExp && filters.minExp !== "") query.experience.$gte = parseInt(filters.minExp);
                if (filters.maxExp && filters.maxExp !== "") query.experience.$lte = parseInt(filters.maxExp);
            }
        }



        console.log("***", query)
        const skip = (page - 1) * limit

        const [data, total] = await Promise.all([
            Doctor.find(query)
                .populate({ path: "departmentId", select: "name" })
                .select("-password -refreshToken -otp -otpExpires")
                .skip(skip)
                .limit(limit),
            Doctor.countDocuments(query)
        ])

        return { data, total }

    }

    async getAllUsers(page: number, limit: number, searchTerm?: string): Promise<{ users: IUser[]; totalUsers?: number | null; }> {
        try {
            const query: any = {}

            if (searchTerm) {
                query.fullName = { $regex: searchTerm, $options: 'i' }
            }




            const skip = (page - 1) * limit;
            const users = await User.find(query)
                .select("-password -refreshToken -otp -otpExpires")
                .skip(skip)
                .limit(limit)
                .exec()

            const totalUsers = await User.countDocuments()

            return { users, totalUsers }

        } catch (error) {
            console.error("Error fetching users:", error);
            throw new Error("Error fetching users");
        }
    }


    async udateDoctorStatus(doctorId: string, status: number): Promise<IDoctor | null> {
        if (![1, -1].includes(status)) {
            throw new Error("Invalid status value. Use -1 for block, 1 for unblock.");
        }

        return await Doctor.findByIdAndUpdate(doctorId, { status }, { new: true }).select("-password -refreshToken")
    }




}

export default AdminRepository