import mongoose, { Document, ObjectId, Schema } from "mongoose";


interface IPersonalInfo {
    age: number;
    gender: "male" | "female";
    blood_group: string;
    allergies:string;
    chronic_disease:string;
}
export interface IAddress {
    houseName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
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
    profileUrl?:string|null;
    updatedAt?: Date;
    createdAt?: Date;
    personalInfo: IPersonalInfo;
    address:IAddress;
    refreshToken: string 

}

const Address = new Schema<IAddress>({
    houseName:{type:String},
    street:{type:String},
    city:{type:String},
    state:{type:String},
    postalCode:{type:String},
    country:{type:String}
})


const PersonalInfoSchema = new Schema<IPersonalInfo>({
    age: { type: Number },
    gender: { type: String,enum:["male","female"]},
    blood_group: { type: String},
    allergies:{type:String,},
    chronic_disease:{type:String}
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
    profileUrl:{
        type:String
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
        type: PersonalInfoSchema
    },
    address:{
        type:Address
    },
    refreshToken: { type: String }
}, { timestamps: true })


const User = mongoose.model<IUser>("user", UserSchema)

export { IUser, User };