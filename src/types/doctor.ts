import { IConsultationAppointment } from "../model/consultationBooking/consultationBooking";
import { IUser } from "../model/user/userModel";
import { IDoctorService } from "../model/doctorService/doctorServicesModal";

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