import mongoose, { Schema, Document } from "mongoose";

export interface IDoctorSubscription extends Document {
  doctorId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}


const DoctorSubscriptionSchema = new Schema<IDoctorSubscription>(
    {
      doctorId: { type: Schema.Types.ObjectId, required: true, ref: "Doctor" },
      planId: { type: Schema.Types.ObjectId, required: true, ref: "Plan" },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      status: { type: String, required: true },
      paymentStatus: { type: String, required: true },
    },
    {
      timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
  );


const DoctorSubscription = mongoose.model<IDoctorSubscription>(
    "DoctorSubscription",
    DoctorSubscriptionSchema
  );

export default DoctorSubscription;