import mongoose, { ObjectId, Types } from "mongoose";
import { IDoctorAvailability, ISlot } from "../model/doctorService/doctorSchedule";

export interface IScheduleResponse {
    _id: Types.ObjectId;
    doctorId: Types.ObjectId;
    serviceId: {
      _id: Types.ObjectId;
      name: string;
      fee: number;
      mode: "Online" | "In-Person" | "Both";
    };
    date: Date;
    start_time: Date;
    end_time: Date;
    duration: number;
    availability: ISlot[];
  }





  export interface InitiateBookingResponse {
    orderId: string;
    amount: number;
    currency: string;
  }
  
  export interface VerifyAndBookResponse {
    bookingId: string;
    slot_id:string
    status: "success";
  }
  


  export interface PopulatedServiceId extends IDoctorAvailability{
    _Id:mongoose.Types.ObjectId;
    name: string;
    mode: 'Online' | 'In-Person' | 'Both';
    fee: number;
}



export interface AppointmentDetailDTO {
  _id: string;
  appointmentDate: string;
  status: string;
  paymentStatus: string;
  slot: {
    start_time: string;
    end_time: string;
  };
  doctor: {
    fullName: string;
    specialization: string;
    experience: number;
    profileImage: string;
    clinicAddress?: {
      clinicName: string;
      street: string;
      city: string;
      state: string;
      country: string;
    };
  };
  prescription?: {
    _id: string;
    fileUrl: string;
    diagnosis: string;
  };
  service?: {
    name: string;
    mode: "Online" | "In-Person" | "Both";
    fee: number;
    description: string;
  }
}



export interface CancelAppointmentResponseDTO {
  message: string;
  refund: {
    status: "eligible" | "not_eligible";
    amount: number;
  };
}

