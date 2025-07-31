import { IDoctor } from "../../../model/doctor/doctorModel";
import { DoctorDTO } from "../../adminDto/doctor.dto";
import { isValidObjectId, Types } from "mongoose";

export const mapDoctorToDTO = (doctor: IDoctor): DoctorDTO => {
    const rating = doctor.rating[0] || { averageRating: 0, totalReviews: 0 };

    let department;
    if (doctor.departmentId && typeof doctor.departmentId === "object" && '_id' in doctor.departmentId) {
        department = {
            id: (doctor.departmentId as any)._id.toString(),
            name: (doctor.departmentId as any).name,
        };
    }

    return {
        _id: doctor._id.toString(),
        fullName: doctor.fullName,
        email: doctor.email,
        mobile: doctor.mobile,
        specialization: doctor.specialization,
        departmentId: department,
        experience: doctor.experience,
        gender: doctor.gender,
        averageRating: rating.averageRating,
        totalReviews: rating.totalReviews,
        education: doctor.education,
        certifications: doctor.certifications,
        profileImage: doctor.profileImage,
        clinicAddress: doctor.clinicAddress
            ? {
                ...doctor.clinicAddress,
                location: Array.isArray(doctor.clinicAddress.location)
                    ? doctor.clinicAddress.location
                    : [],
            }
            : undefined,
        isVerified: doctor.isVerified,
        licenseNumber: doctor.licenseNumber,
        licenseDocument: doctor.licenseDocument,
        IDProofDocument: doctor.IDProofDocument,
        isSubscribed: doctor.isSubscribed,
        subscriptionExpiryDate: doctor.subscriptionExpiryDate,
        availability: doctor.availability,
        status: doctor.status,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
    };
};
