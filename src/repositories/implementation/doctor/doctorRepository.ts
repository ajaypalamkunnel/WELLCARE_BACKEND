import mongoose from "mongoose";
import { StatusCode } from "../../../constants/statusCode";
import Doctor, { ICertification, IDoctor, IEducation } from "../../../model/doctor/doctorModel";
import { firstChatDTO } from "../../../types/chat";
import { AddEducationDTO } from "../../../types/doctor";
import { CustomError } from "../../../utils/CustomError";
import { BaseRepository } from "../../base/BaseRepository";
import IDoctorRepository from "../../interfaces/doctor/IDoctor";
import NotificationModel, { INotification } from "../../../model/notification/notificationModel";


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


    async getDoctorProfile(doctorId: string): Promise<IDoctor | null> {
        try {
            const doctor = await Doctor.findOne({ _id: doctorId })
                .populate("departmentId", "name")
                .select("-password -refreshToken -subscriptionExpiryDate -licenseDocument -IDProofDocument")
            return doctor
        } catch (error) {
            console.error("Error featching doctors profile", error);
            throw new Error("Database error while fetching doctor profile")
        }
    }


    async findDoctorByIdAndGetSubscriptionDetails(doctorId: string): Promise<IDoctor | null> {
        try {

            const doctorSubscriptionDetails = await Doctor.findById(doctorId).populate("currentSubscriptionId")
                .select("-password -refreshToken -licenseDocument -IDProofDocument")
            return doctorSubscriptionDetails
        } catch (error) {
            console.error("Error featching doctors subscription", error);
            throw new Error("Database error while fetching doctor profile")
        }
    }


    async getBasicDoctorInfoById(doctorId: string): Promise<firstChatDTO | null> {
        return await Doctor.findById(doctorId, "_id fullName profileImage")
    }


    async addEducation(doctorId: string, education: AddEducationDTO): Promise<IEducation[]> {
        try {

            const { degree, institution, yearOfCompletion } = education



            const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, {
                $push: {
                    education: {
                        degree,
                        institution,
                        yearOfCompletion
                    }
                }
            },
                { new: true, select: "education" }
            )

            if (!updatedDoctor) return []

            return updatedDoctor.education
        } catch (error) {

            throw new CustomError("Internal server error", StatusCode.INTERNAL_SERVER_ERROR)

        }
    }


    async addCertification(doctorId: string, certification: ICertification): Promise<ICertification> {

        try {

            const { name, issuedBy, yearOfIssue } = certification;

            const newCertification: ICertification = {
                name,
                issuedBy,
                yearOfIssue
            } as ICertification

            const updateCertificate = await Doctor.findByIdAndUpdate(doctorId, {
                $push: {
                    certifications: newCertification
                }
            },
                { new: true }
            )

            if (!updateCertificate) {
                throw new CustomError("Docotor not found", StatusCode.NOT_FOUND)
            }

            return newCertification

        } catch (error) {

            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError("Internal server Error", StatusCode.INTERNAL_SERVER_ERROR)
            }

        }



    }


    async editEducation(doctorId: string, updateEducation: IEducation): Promise<IEducation> {

        try {

            console.log("repo", updateEducation)

            const { _id, degree, institution, yearOfCompletion } = updateEducation

            const updated = await Doctor.findOneAndUpdate({
                _id: new mongoose.Types.ObjectId(doctorId),
                "education._id": new mongoose.Types.ObjectId(_id)
            },
                {
                    $set: {
                        "education.$.degree": degree,
                        "education.$.institution": institution,
                        "education.$.yearOfCompletion": yearOfCompletion,
                    }
                },
                { new: true, projection: { education: 1 } }

            )

            if (!updated) {
                throw new CustomError("Education entry not found", StatusCode.NOT_FOUND);
            }

            console.log("updated", updated);




            const updatedEducation = updated?.education.find(
                (edu) => edu?._id?.toString() === _id
            );

            console.log(":----", updatedEducation)
            if (!updatedEducation) {
                throw new CustomError("Updated education not found", StatusCode.NOT_FOUND);
            }
            return updatedEducation;

        } catch (error) {

            if (error instanceof CustomError) {
                console.log("database error:-", error);

                throw error
            } else {
                console.log("database error:-", error);
                throw new CustomError("Internal server errorr", StatusCode.INTERNAL_SERVER_ERROR)
            }

        }



    }



    async editCertification(doctorId: string, updateCertification: ICertification): Promise<ICertification> {
        try {

            console.log("repo---", updateCertification);


            const { _id, name, issuedBy, yearOfIssue } = updateCertification

            const updated = await Doctor.findOneAndUpdate({
                _id: new mongoose.Types.ObjectId(doctorId),
                "certifications._id": new mongoose.Types.ObjectId(_id)
            },
                {
                    $set: {
                        "certifications.$.name": name,
                        "certifications.$.issuedBy": issuedBy,
                        "certifications.$.yearOfIssue": yearOfIssue,
                    },

                }
                , { new: true, projection: { certifications: 1 } }
            )

            console.log("....", updated);


            if (!updated) {
                throw new CustomError("certification entry not found", StatusCode.NOT_FOUND);
            }

            const updatedCertification = updated.certifications.find(
                (cert) => cert._id?.toString() === _id
            )

            if (!updatedCertification) {
                throw new CustomError("Updated certification not found", StatusCode.NOT_FOUND)
            }


            return updatedCertification
        } catch (error) {

            console.error("certifiacation updating error", error);


            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError("Internal server error", StatusCode.INTERNAL_SERVER_ERROR)
            }

        }
    }


    async getAllNotifications(userId: string): Promise<INotification[]> {
        const notifIcations = await NotificationModel.find({ userId })
            .sort({ createdAt: -1 })

        return notifIcations

    }








}


export default DoctorRepository