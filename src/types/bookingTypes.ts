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