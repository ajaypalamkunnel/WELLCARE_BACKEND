import mongoose, { Schema, Document } from "mongoose";

export type PaymentStatus = "created" | "paid" | "failed" | "refund";

export interface IPayment extends Document {
  appointmentId?: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "ConsultationAppointment" },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refund"],
      default: "created",
    },
    method: { type: String },
    transactionId: { type: String },
  },
  { timestamps: true }
);

const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);
export default PaymentModel;
