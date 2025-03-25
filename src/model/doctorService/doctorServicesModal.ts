import mongoose, { Schema, Document } from "mongoose";


export interface IDoctorService extends Document {
    name: string,
    mode: 'Online' | 'In-Person' | 'Both',
    fee:number
    description:string,
    isActive?:boolean,
    doctorId: mongoose.Types.ObjectId;
    createdAt?:Date,
    updatedAt?:Date

}


const ServiceSchema = new Schema<IDoctorService>(
    {
        name:{type:String,required:true},
        mode: {type:String,enum:['Online','In-Person','Both'],required:true},
        fee:{type:Number,required:true},
        description:{type:String,required:true},
        isActive:{type:Boolean,required:true},
        doctorId: { type: Schema.Types.ObjectId, required: true, ref: "Doctor" },
        createdAt:{type:Date,default:Date.now},
        updatedAt:{type:Date,default:Date.now}

        
    }
)

const Services = mongoose.model<IDoctorService>("Service",ServiceSchema)


export default Services