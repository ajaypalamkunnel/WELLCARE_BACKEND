import { IDoctor } from "../../../model/doctor/doctorModel";
import { DoctorProfileDTO, RatingDTO, ReviewDTO } from "../../doctorDto/doctorProfile.dto";

export const mapDoctorProfileToDTO = (doctorDoc: IDoctor): DoctorProfileDTO => {
  const doc = doctorDoc.toObject();

  return {
    _id: doc._id.toString(),
    fullName: doc.fullName,
    email: doc.email,
    mobile: doc.mobile,
    specialization: doc.specialization,
    departmentId: typeof doc.departmentId === "object" && doc.departmentId !== null
      ? {
          _id: doc.departmentId._id?.toString(),
          name: doc.departmentId.name,
        }
      : doc.departmentId.toString(),
    experience: doc.experience,
    gender: doc.gender,
    rating: doc.rating.map((r:RatingDTO) => ({
      averageRating: r.averageRating,
      totalReviews: r.totalReviews
    })),
    reviews: doc.reviews.map((r:ReviewDTO) => ({
      patientId: r.patientId,
      rating: r.rating,
      reviewText: r.reviewText,
      createdAt: r.createdAt
    })),
    profileImage: doc.profileImage,
    education: doc.education,
    certifications: doc.certifications,
    currentSubscriptionId: doc.currentSubscriptionId?.toString(),
    isSubscribed: doc.isSubscribed,
    subscriptionExpiryDate: doc.subscriptionExpiryDate,
    availability: doc.availability,
    clinicAddress: doc.clinicAddress ? {
      clinicName: doc.clinicAddress.clinicName,
      street: doc.clinicAddress.street,
      city: doc.clinicAddress.city,
      state: doc.clinicAddress.state,
      postalCode: doc.clinicAddress.postalCode,
      country: doc.clinicAddress.country,
      location: doc.clinicAddress.location
    } : undefined,
    licenseNumber: doc.licenseNumber,
    licenseDocument: doc.licenseDocument,
    IDProofDocument: doc.IDProofDocument,
    isVerified: doc.isVerified,
    rejectReason: doc.rejectReason,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};
