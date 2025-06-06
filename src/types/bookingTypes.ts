import mongoose, {Types } from "mongoose";
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
  prescriptionUrl?:string
  paymentStatus: string;
  slot: {
    start_time: string;
    end_time: string;
  };
  doctor: {
    _id:string
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




export interface DoctorAppointmentListItemDTO {
  _id: string;
  appointmentDate: Date;
  status: "booked" | "completed" | "cancelled" | "pending" | "rescheduled";
  paymentStatus: "paid" | "pending" | "failed" | "unpaid" | "refunded";
  slot: {
    start_time: Date;
    end_time: Date;
  };
  patient: {
    _id: string;
    fullName: string;
    gender: "male" | "female";
    profileUrl?: string;
  };
  service: {
    name: string;
    mode: "online" | "in-person" | "both";
  };
}



export interface PaginatedAppointmentListDTO {
  data: DoctorAppointmentListItemDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}



export interface DoctorAppointmentDetailDTO {
  _id: string;
  appointmentDate: Date;
  status: string;
  paymentStatus: string;

  slot: {
    start_time: Date;
    end_time: Date;
  };

  service: {
    name: string;
    mode: "Online" | "In-Person";
    fee: number;
    description?: string;
  };

  patient: {
    _id: string;
    fullName: string;
    gender: string;
    mobile: string;
    profileUrl?: string;
    address?: {
      houseName?: string;
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    personalInfo?: {
      age: number;
      blood_group: string;
      allergies: string;
      chronic_disease: string;
    };
  };

  prescription?: {
    _id: string;
    fileUrl: string;
    diagnosis: string;
  };
}


export interface bookingFeeDTO{
  fee:number

}

export enum Reason{
  AppoinTmentFee = "appointment fee",
  AppointmentCancelNotERefund = "appoinment canceled not eligible for refund"
}


export interface DoctorFilter {
  isVerified?: string;       // "true" | "false"
  status?: string;           // "1" | "-1"
  availability?: string;     // "Online,Offline"
  departmentId?: string;     // ObjectId string
  isSubscribed?: string;     // "true" | "false"
  minExp?: string;           // number as string
  maxExp?: string;           // number as string
}



export interface TimeBlock {
  start_time: string; // e.g. "10:00"
  end_time: string;   // e.g. "13:00"
}


export interface GeneratedSlot {
  slot_id: mongoose.Types.ObjectId;
  start_time: Date;
  end_time: Date;
  status: "available";
  is_break: boolean;
}


export interface GeneratedScheduleBlock {
  date: Date;
  start_time: Date;
  end_time: Date;
  conflict: boolean;
  slots: GeneratedSlot[];
}

export interface RecurringSlotRequest {
  doctorId: string;
  serviceId: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  timeBlocks: { start_time: string; end_time: string }[];
}


export interface CreateMultiDayScheduleRequest {
  doctorId: string;
  serviceId: string;
  startDate: Date;
  endDate?: Date;
  duration: number;
  timeBlocks: TimeBlock[];
}