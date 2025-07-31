export interface DepartmentDTO {
  _id: string;
  name: string;
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
  yearOfIssue?: number;
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

export interface DoctorListDTO {
  _id: string;
  fullName: string;
  availability: string[];
  isVerified: boolean;
  status: number;
  rating: RatingDTO[];
  education: EducationDTO[];
  certifications: CertificationDTO[];
  departmentId: DepartmentDTO;
  experience: number;
  gender: string;
  profileImage: string;
  specialization: string;
  currentSubscriptionId?: string;
  clinicAddress?: ClinicAddressDTO;
}
