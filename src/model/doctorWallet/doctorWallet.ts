import mongoose, { Schema, Document } from "mongoose";

export interface IDoctorWalletTransaction {
  type: "credit" | "debit";
  amount: number;
  reason: string;
  relatedAppointmentId?: mongoose.Types.ObjectId;
  status: "success" | "pending" | "failed";
  createdAt: Date;
}

export interface IDoctorWallet extends Document {
  doctorId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  transactions: IDoctorWalletTransaction[];
  createdAt?: Date;
  updatedAt?: Date;
}

const DoctorWalletTransactionSchema = new Schema<IDoctorWalletTransaction>(
  {
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    relatedAppointmentId: {
      type: Schema.Types.ObjectId,
      ref: "ConsultationAppointment",
    },
    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DoctorWalletSchema = new Schema<IDoctorWallet>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "INR" },
    transactions: [DoctorWalletTransactionSchema],
  },
  { timestamps: true }
);

const DoctorWallet = mongoose.model<IDoctorWallet>("DoctorWallet", DoctorWalletSchema);
export default DoctorWallet;
