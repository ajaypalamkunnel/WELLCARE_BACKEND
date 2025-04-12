
import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  transactions: IWalletTransaction[];
  updatedAt?: Date;
  createdAt?: Date;
}


export interface IWalletTransaction {
    type: "credit" | "debit";
    amount: number;
    reason: string;
    relatedAppointmentId?: mongoose.Types.ObjectId;
    status: "success" | "failed" | "pending";
    createdAt: Date;
  }
  

  const WalletTransactionSchema = new Schema<IWalletTransaction>(
    {
      type: { type: String, enum: ["credit", "debit"], required: true },
      amount: { type: Number, required: true },
      reason: { type: String, required: true },
      relatedAppointmentId: { type: Schema.Types.ObjectId, ref: "ConsultationAppointment" },
      status: { type: String, enum: ["success", "failed", "pending"], default: "success" },
      createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
  );
  
  const WalletSchema = new Schema<IWallet>(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
      balance: { type: Number, required: true, default: 0 },
      currency: { type: String, default: "INR" },
      transactions: [WalletTransactionSchema],
    },
    { timestamps: true }
  );
  
  const Wallet = mongoose.model<IWallet>("Wallet", WalletSchema);
  
  export default Wallet;
  