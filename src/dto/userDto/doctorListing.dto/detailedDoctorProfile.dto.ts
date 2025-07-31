export interface DetailedDoctorProfileDTO {
  _id: string;
  fullName: string;
  email: string;
  isSubscribed: boolean;
  availability: string[];
  isVerified: boolean;
  status: number;
  rating: {
    averageRating: number;
    totalReviews: number;
  }[];
  reviews: {
    patientId: string;
    rating: number;
    reviewText: string;
    createdAt: Date;
  }[];
  education: {
    _id?: string;
    degree: string;
    institution: string;
    yearOfCompletion: number;
  }[];
  certifications: {
    _id?: string;
    name: string;
    issuedBy: string;
    yearOfIssue: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
  departmentId: {
    _id: string;
    name: string;
  };
  experience: number;
  gender: string;
  mobile: string;
  profileImage: string;
  specialization: string;
  subscriptionExpiryDate?: Date;
  clinicAddress?: {
    clinicName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    location: any[]; // Keeping any[] due to dynamic type
  };
}
