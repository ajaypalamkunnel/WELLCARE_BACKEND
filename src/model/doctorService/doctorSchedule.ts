    import mongoose,{Schema,Document} from "mongoose";
import { IDoctorService } from "./doctorServicesModal";


    export type SlotStatus =
    | "available"
    | "booked"
    | "cancelled"
    | "completed"
    | "pending"
    | "rescheduled";


    export interface ISlot {
        slot_id: mongoose.Types.ObjectId;
        start_time: Date;
        end_time: Date;
        status: SlotStatus;
        is_break: boolean;
    }



    export interface IDoctorAvailability extends Document {
        doctorId: mongoose.Types.ObjectId;
        serviceId: mongoose.Types.ObjectId;
        date: Date;
        start_time: Date;
        end_time: Date;
        duration: number;
        isCancelled:boolean;
        cancellationReason:string;
        cancelledAt:Date;
        availability: ISlot[];
    }


    const DoctorSchedulesSchema = new Schema<IDoctorAvailability>({
        doctorId:{ type: Schema.Types.ObjectId, required: true, ref: "Doctor" },
        serviceId: { type: Schema.Types.ObjectId, required: true, ref: "Service" },
        date: { type: Date, required: true },
        start_time: { type: Date, required: true },
        end_time: { type: Date, required: true },
        duration: { type: Number, required: true },
        isCancelled: { type: Boolean, default: false },
        cancellationReason: { type: String },
        cancelledAt: { type: Date },
        availability:[
            {
                slot_id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
                start_time: { type: Date, required: true },
                end_time: { type: Date, required: true },
                status: {
                    type: String,
                    enum: [
                        "available",
                        "booked",
                        "cancelled",
                        "completed",
                        "pending",
                        "rescheduled",
                    ],
                    default: "available",
                },
                is_break: { type: Boolean, default: false },
                
            }
        ]
    })


const DoctorSchedules = mongoose.model<IDoctorAvailability>(
        "DoctorSchedules",
        DoctorSchedulesSchema
    )
export default DoctorSchedules