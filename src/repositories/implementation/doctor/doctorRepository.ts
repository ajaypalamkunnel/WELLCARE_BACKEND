import Doctor, { IDoctor } from "../../../model/doctor/doctorModel";
import { firstChatDTO } from "../../../types/chat";
import { BaseRepository } from "../../base/BaseRepository";
import IDoctorRepository from "../../interfaces/doctor/IDoctor";


class DoctorRepository extends BaseRepository<IDoctor> implements IDoctorRepository {


    constructor() {
        super(Doctor);
    }
    
    
    



    async findDoctorByEmail(email: string): Promise<IDoctor | null> {
        console.log(email);

        return await Doctor.findOne({ email })
    }

    async updateDoctorRefreshToken(id: string, refreshToken: string): Promise<IDoctor | null> {
        return await Doctor.findByIdAndUpdate(id, { refreshToken });
    }

    async removeRefreshToken(refreshToken: string): Promise<void> {
        await Doctor.updateOne({ refreshToken }, { $unset: { refreshToken: 1 } })
    }


    async findUserDataById(userId: string): Promise<IDoctor | null> {
        return await Doctor.findById(userId).select("-password -refreshToken").populate({ path: "departmentId", select: "name" })
    }


    async udateDoctorStatus(doctorId: string, status: number): Promise<IDoctor | null> {
        if (![1, -1].includes(status)) {
            throw new Error("Invalid status value. Use -1 for block, 1 for unblock.");
        }

        return await Doctor.findByIdAndUpdate(doctorId, { status }, { new: true }).select("-password -refreshToken")
    }

    async updateDoctorVerification(doctorId: string, isVerified: boolean, status?: number): Promise<IDoctor | null> {

        const updateFields: Partial<IDoctor> = { isVerified }; // Always update isVerified

        if (status !== undefined) {
            updateFields.status = status; // Only update status if provided
        }



        return await Doctor.findByIdAndUpdate(
            doctorId,
            updateFields,
            { new: true }
        ).select("-password -refreshToken")
    }


    async updatePassword(userId: string, hashedPassword: string): Promise<boolean> {
        const user = await Doctor.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true })
        return !!user
    }


    async findDoctorsWithFilters(filters: any, sortOption: any, page: number, limit: number): Promise<{ doctors: IDoctor[]; total: number; }> {
        try {



            const skip = (page - 1) * limit;

            const doctors = await Doctor.find(filters)
                .populate("departmentId", "name")
                .select("-password -refreshToken -subscriptionExpiryDate -licenseDocument -IDProofDocument")
                .sort(sortOption)
                .skip(skip)
                .limit(limit)

            const total = await Doctor.countDocuments(filters)

            return { doctors, total }

        } catch (error) {

            console.error("Error fetching doctors:", error);
            throw new Error("Database error while fetching doctors");

        }
    }


    async getDoctorProfile(doctorId: string): Promise<IDoctor|null> {
        try {
            const doctor = await Doctor.findOne({_id:doctorId})
                            .populate("departmentId","name")
                            .select("-password -refreshToken -subscriptionExpiryDate -licenseDocument -IDProofDocument")
            return doctor
        } catch (error) {
            console.error("Error featching doctors profile",error);
            throw new Error("Database error while fetching doctor profile") 
        }
    }


   async findDoctorByIdAndGetSubscriptionDetails(doctorId: string): Promise<IDoctor | null> {
        try {

            const doctorSubscriptionDetails = await Doctor.findById(doctorId).populate("currentSubscriptionId")
                .select("-password -refreshToken -licenseDocument -IDProofDocument")
            return doctorSubscriptionDetails
        } catch (error) {
            console.error("Error featching doctors subscription",error);
            throw new Error("Database error while fetching doctor profile") 
        }
    }


    async getBasicDoctorInfoById(doctorId: string): Promise<firstChatDTO | null> {
        return await Doctor.findById(doctorId,"_id fullName profileImage")
    }





}


export default DoctorRepository