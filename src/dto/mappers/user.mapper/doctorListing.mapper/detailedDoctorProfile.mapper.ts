import { IDoctor } from "../../../../model/doctor/doctorModel";
import { CertificationDTO, EducationDTO, ReviewDTO } from "../../../doctorDto/doctorProfile.dto";
import { DetailedDoctorProfileDTO } from "../../../userDto/doctorListing.dto/detailedDoctorProfile.dto";
import { RatingDTO } from "../../../userDto/doctorListing.dto/doctorList.dto";



export const mapToDetailedDoctorProfileDTO = (
  doctor: IDoctor
): DetailedDoctorProfileDTO => {
  const doc = doctor.toObject();

  return {
    _id: doc._id.toString(),
    fullName: doc.fullName,
    email: doc.email,
    isSubscribed: doc.isSubscribed,
    availability: doc.availability,
    isVerified: doc.isVerified,
    status: doc.status,
    rating: doc.rating.map((r:RatingDTO) => ({
      averageRating: r.averageRating,
      totalReviews: r.totalReviews
    })),
    reviews: doc.reviews.map((review:ReviewDTO) => ({
      patientId: review.patientId,
      rating: review.rating,
      reviewText: review.reviewText,
      createdAt: review.createdAt
    })),
    education: doc.education.map((edu:EducationDTO) => ({
      _id: edu._id?.toString(),
      degree: edu.degree,
      institution: edu.institution,
      yearOfCompletion: edu.yearOfCompletion
    })),
    certifications: doc.certifications.map((cert:CertificationDTO) => ({
      _id: cert._id?.toString(),
      name: cert.name,
      issuedBy: cert.issuedBy,
      yearOfIssue: cert.yearOfIssue
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    departmentId:
      typeof doc.departmentId === "object"
        ? {
            _id: doc.departmentId._id?.toString(),
            name: doc.departmentId.name
          }
        : { _id: "", name: "" },
    experience: doc.experience,
    gender: doc.gender,
    mobile: doc.mobile,
    profileImage: doc.profileImage,
    specialization: doc.specialization,
    subscriptionExpiryDate: doc.subscriptionExpiryDate,
    clinicAddress: doc.clinicAddress
      ? {
          clinicName: doc.clinicAddress.clinicName,
          street: doc.clinicAddress.street,
          city: doc.clinicAddress.city,
          state: doc.clinicAddress.state,
          postalCode: doc.clinicAddress.postalCode,
          country: doc.clinicAddress.country,
          location: doc.clinicAddress.location
        }
      : undefined
  };
};
