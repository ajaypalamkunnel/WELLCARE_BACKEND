import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    userRole: "Doctor" | "user";
    title: string;
    message: string;
    link?: string;
    type: "appointment" | "system" | "message";
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationnSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "userRole",
        },
        userRole: {
            type: String,
            required: true,
            enum: ["Doctor", "user"],
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        link: { type: String },
        type: {
            type: String,
            enum: ["appointment", "system", "message"],
            default: "system",
        },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }

)

const NotificationModel = mongoose.model<INotification>("Notification",NotificationnSchema)

export default NotificationModel