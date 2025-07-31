export interface UserProfileDTO {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  status: number;
  isVerified: boolean;
  profileUrl?: string | null;
  updatedAt?: Date;
  createdAt?: Date;
  personalInfo?: {
    age?: number;
    gender?: "male" | "female";
    blood_group?: string;
    allergies?: string;
    chronic_disease?: string;
  };
  address?: {
    houseName?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}
