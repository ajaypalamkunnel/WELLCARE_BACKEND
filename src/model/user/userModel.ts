import mongoose, { Document, ObjectId, Schema } from "mongoose";


interface IPersonalInfo {
    age: number;
    gender: string;
    blood_group: string;
}


interface IUser extends Document {
    _id: ObjectId;
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    status: number;
    isVerified: boolean;
    otp?: string | null;
    otpExpires?: Date | null;
    updatedAt?: Date;
    createdAt?: Date;
    personalInfo: IPersonalInfo
}

const PersonalInfoSchema = new Schema<IPersonalInfo>({
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    blood_group: { type: String, required: true },
}, { _id: false })


const UserSchema = new Schema<IUser>({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    mobile: {
        type: String,
        //required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean, //to handle complete registration
        default: false
    },
    status: {
        type: Number,
        enum: [-1, 0, 1],// -1 => blocked 0 => not verified 1 => verified
        default: 0
    },
    otp: { type: String, required: false },
    otpExpires: { type: Date, required: false, expires: 300 },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    personalInfo: {
        type: PersonalInfoSchema,
        //required: true
    }
}, { timestamps: true })


const User = mongoose.model<IUser>("user", UserSchema)

export { IUser, User };