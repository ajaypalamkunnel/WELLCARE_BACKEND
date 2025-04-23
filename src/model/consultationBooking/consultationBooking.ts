import mongoose, { Schema, Document } from "mongoose";
import { SlotStatus } from "../doctorService/doctorSchedule";

export type PaymentStatus =
  | "paid"
  | "unpaid"
  | "pending"
  | "failed"
  | "refunded"


export interface ICancellation {
  reason: string,
  cancelledAt: Date
  refundStatus: "eligible" | "not_eligible";
  refundAmount: number;
}
export interface IConsultationAppointment extends Document {
  _id: mongoose.Types.ObjectId
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  doctorScheduleId: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
  status: SlotStatus;
  prescriptionId?: mongoose.Types.ObjectId;
  paymentStatus: PaymentStatus;
  cancellation?: ICancellation;
  createdAt?: Date;
  updatedAt?: Date;
}

const ConsultationAppointmentSchema = new Schema<IConsultationAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    doctorId: { type: Schema.Types.ObjectId, required: true, ref: "Doctor" },
    departmentId: { type: Schema.Types.ObjectId, required: true, ref: "Department" },
    serviceId: { type: Schema.Types.ObjectId, required: true, ref: "Service" },
    appointmentDate: { type: Date, required: true },
    doctorScheduleId: { type: Schema.Types.ObjectId, required: true, ref: "DoctorSchedules" },
    slotId: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ["available", "booked", "cancelled", "completed", "pending", "rescheduled"],
      default: "pending",
    },
    cancellation: {
      reason: { type: String },
      cancelledAt: { type: Date },
      refundStatus: {
        type: String,
        enum: ["eligible", "not_eligible"]
      },
      refundAmount: {
        type: Number
      }
    },
    prescriptionId: { type: Schema.Types.ObjectId, ref: "Prescription", default: null },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "pending", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const ConsultationAppointmentModal = mongoose.model<IConsultationAppointment>(
  "ConsultationAppointment",
  ConsultationAppointmentSchema
);


ConsultationAppointmentSchema.index({ patientId: 1, appointmentDate: -1 });
ConsultationAppointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
ConsultationAppointmentSchema.index({ status: 1, appointmentDate: 1 });
ConsultationAppointmentSchema.index({ paymentStatus: 1, appointmentDate: 1 });

export default ConsultationAppointmentModal;