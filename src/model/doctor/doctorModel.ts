import mongoose, { ObjectId, Schema,Document } from "mongoose";

export interface IReview {
    patientId: string;
    rating: number;
    reviewText: string;
    createdAt: Date;
}


export interface IRating {
    averageRating: number;
    totalReviews: number;
}

export interface IEducation {
    degree: string;
    institution: string;
    yearOfCompletion: number;
}

export interface ICertification {
    name: string;
    issuedBy: string;
    year: number;
}

export interface ILocation {
    type: string;
    coordinates: number[];
}

export interface IClinicAddress {
    clinicName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    location: ILocation;
}


export interface IDoctor extends Document {
    _id: ObjectId
    fullName: string;
    email: string;
    password: string
    mobile: string;
    specialization: string;
    departmentId: ObjectId;
    experience: number;
    rating: IRating[];
    reviews: IReview[];
    profileImage: string;
    education: IEducation[];
    certifications: ICertification[];
    currentSubscriptionId?: ObjectId;
    availability: string[]
    clinicAddress?: IClinicAddress;
    licenseNumber: string;
    licenseDocument: string;
    IDProofDocument: string;
    isVerified: boolean;
    otp?: string | null;
    otpExpires?: Date | null
    status: number;// -1 => blocked 0 => not verified 1 => verified
    createdAt: Date;
    updatedAt: Date;
    refreshToken:string
}


const DoctorSchema = new Schema<IDoctor>(
    {

        fullName: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        mobile: { type: String,},
        specialization: { type: String },
        departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", },
        experience: { type: Number, },
        rating: [
            {
                averageRating: { type: Number, },
                totalReviews: { type: Number,  }
            }
        ],
        reviews: [
            {
                patientId: { type: String,  },
                rating: { type: Number, },
                reviewText: { type: String,},
                createdAt: { type: Date, default: Date.now }
            }
        ],
        education: [
            {
                degree: { type: String,  },
                institution: { type: String,},
                yearOfCompletion: { type: Number, }
            }
        ],
        certifications: [
            {
                name: { type: String, },
                issuedBy: { type: String, },
                year: { type: Number,}
            }
        ],
        currentSubscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
        availability:{ type: [String]},
        clinicAddress: {
            clinicName: String,
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
            location:[]
        },
        profileImage: { type: String },
        licenseNumber: { type: String,  },
        licenseDocument: { type: String,  },
        IDProofDocument: { type: String, },
        isVerified: { type: Boolean, default: false },
        otp: { type: String,  },
        otpExpires: { type: Date, required: false, expires: 300 },
        status: {
            type: Number,
            enum: [-1, 0, 1],// -1 => blocked 0 => not verified 1 => verified
            default: 0
        },
        refreshToken: { type: String }

    },
    { timestamps: true }
)

const Doctor = mongoose.model<IDoctor>("Doctor", DoctorSchema)

export default Doctor