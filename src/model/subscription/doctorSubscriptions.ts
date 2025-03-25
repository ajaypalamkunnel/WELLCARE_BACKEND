import mongoose, { Schema, Document, ObjectId } from "mongoose";
import { ISubscription } from "./subscriptionModel";

export interface IDoctorSubscription extends Document {
    _id: ObjectId
    doctorId: mongoose.Types.ObjectId;
    planId: mongoose.Types.ObjectId | ISubscription;
    orderId: string; // Razorpay Order ID
    startDate?: Date | null; // Nullable, set after payment
    endDate?: Date | null;
    status: "pending" | "active" | "expired" | "canceled"; // Enum for clarity
    paymentStatus: "pending" | "paid" | "failed";
    paymentDetails?: {
        paymentId: string;
        paymentMethod: string;
        paymentAmount: number;
    };
    createdAt: Date;
    updatedAt: Date;
}


const DoctorSubscriptionSchema = new Schema<IDoctorSubscription>(
    {
        doctorId: { type: Schema.Types.ObjectId, required: true, ref: "Doctor" },
        planId: { type: Schema.Types.ObjectId, required: true, ref: "Subscription" },
        orderId: { type: String, required: true, unique: true }, // Razorpay Order ID
        startDate: { type: Date, required: false, default: null }, // Nullable until payment
        endDate: { type: Date, required: false, default: null }, // Nullable until payment
        status: { type: String, enum: ["pending", "active", "expired", "canceled"], required: true, default: "pending" },
        paymentStatus: { type: String, enum: ["pending", "paid", "failed"], required: true, default: "pending" },
        paymentDetails: {
            paymentId: { type: String },
            paymentMethod: { type: String },
            paymentAmount: { type: Number },
        },
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