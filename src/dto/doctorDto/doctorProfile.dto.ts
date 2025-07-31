export interface ReviewDTO {
  patientId: string;
  rating: number;
  reviewText: string;
  createdAt: Date;
}

export interface RatingDTO {
  averageRating: number;
  totalReviews: number;
}

export interface EducationDTO {
  _id?: string;
  degree: string;
  institution: string;
  yearOfCompletion: number;
}

export interface CertificationDTO {
  _id?: string;
  name: string;
  issuedBy: string;
  yearOfIssue: number;
}

export interface DepartmentDTO {
  _id: string;
  name: string;
}

export interface ClinicAddressDTO {
  clinicName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location: any[];
}

export interface DoctorProfileDTO {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  specialization: string;
  departmentId: DepartmentDTO | string;
  experience: number;
  gender: string;
  rating: RatingDTO[];
  reviews: ReviewDTO[];
  profileImage: string;
  education: EducationDTO[];
  certifications: CertificationDTO[];
  currentSubscriptionId?: string;
  isSubscribed: boolean;
  subscriptionExpiryDate?: Date;
  availability: string[];
  clinicAddress?: ClinicAddressDTO;
  licenseNumber: string;
  licenseDocument: string;
  IDProofDocument: string;
  isVerified: boolean;
  rejectReason?: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}
