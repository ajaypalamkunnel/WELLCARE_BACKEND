import { IUser } from "../../../../model/user/userModel";
import { UserProfileDTO } from "../../../userDto/doctorListing.dto/userProfile.dto";
export const mapToUserProfileDTO = (user: IUser): UserProfileDTO => {
  const doc = user.toObject();

  return {
    _id: doc._id.toString(),
    fullName: doc.fullName,
    email: doc.email,
    mobile: doc.mobile,
    status: doc.status,
    isVerified: doc.isVerified,
    profileUrl: doc.profileUrl ?? null,
    updatedAt: doc.updatedAt,
    createdAt: doc.createdAt,
    personalInfo: doc.personalInfo
      ? {
          age: doc.personalInfo.age,
          gender: doc.personalInfo.gender,
          blood_group: doc.personalInfo.blood_group,
          allergies: doc.personalInfo.allergies,
          chronic_disease: doc.personalInfo.chronic_disease
        }
      : undefined,
    address: doc.address
      ? {
          houseName: doc.address.houseName,
          street: doc.address.street,
          city: doc.address.city,
          state: doc.address.state,
          postalCode: doc.address.postalCode,
          country: doc.address.country
        }
      : undefined
  };
};
