import { IDoctor } from "../../../../model/doctor/doctorModel";
import { CertificationDTO, DoctorListDTO, EducationDTO, RatingDTO } from "../../../userDto/doctorListing.dto/doctorList.dto";

export const mapDoctorListToDTO = (doctor: IDoctor): DoctorListDTO => {
  const doc = doctor.toObject();

  return {
    _id: doc._id.toString(),
    fullName: doc.fullName,
    availability: doc.availability,
    isVerified: doc.isVerified,
    status: doc.status,
    rating: doc.rating.map((r:RatingDTO) => ({
      averageRating: r.averageRating,
      totalReviews: r.totalReviews
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
    departmentId: typeof doc.departmentId === "object" && doc.departmentId !== null
      ? {
          _id: doc.departmentId._id?.toString(),
          name: doc.departmentId.name,
        }
      : { _id: "", name: "" },
    experience: doc.experience,
    gender: doc.gender,
    profileImage: doc.profileImage,
    specialization: doc.specialization,
    currentSubscriptionId: doc.currentSubscriptionId?.toString(),
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
