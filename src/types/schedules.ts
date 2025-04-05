import mongoose from "mongoose";
import { SlotStatus } from "../model/doctorService/doctorSchedule";

export interface IScheduleValidationResponse {
    success: boolean;
    message: string;
}


export interface TempSlot{
    slot_id: mongoose.Types.ObjectId;
    start_time: Date,
    end_time: Date,
    status?: SlotStatus
    is_break?:boolean
}

