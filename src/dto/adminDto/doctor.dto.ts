import { IConsultationAppointment } from "../../model/consultationBooking/consultationBooking";
import { IUser } from "../../model/user/userModel";
import { IDoctorService } from "../../model/doctorService/doctorServicesModal";

// dto/doctor/AddEducationDTO.ts
export interface AddEducationDTO {
    degree: string;
    institution: string;
    yearOfCompletion: number;
  }
  

export type PopulatedAppointment = Omit<IConsultationAppointment, "patientId" | "serviceId"> & {
  patientId: IUser;
  serviceId: IDoctorService;
};


export interface DoctorDTO {
    _id: string;
    fullName: string;
    email: string;
    mobile: string;
    specialization: string;
    departmentId?: { id: string; name: string };
    experience: number;
    gender: string;
    averageRating: number;
    totalReviews: number;
    education: {
        degree: string;
        institution: string;
        yearOfCompletion: number;
    }[];
    certifications: {
        name: string;
        issuedBy: string;
        yearOfIssue: number;
    }[];
    profileImage: string;
    clinicAddress?: {
        clinicName: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        location: number[];
    };
    isVerified: boolean;
     licenseNumber: string;
    licenseDocument: string;
    IDProofDocument: string;
    isSubscribed: boolean;
    subscriptionExpiryDate?: Date;
    availability: string[];
    status: number;
    createdAt: Date;
    updatedAt: Date;
}



