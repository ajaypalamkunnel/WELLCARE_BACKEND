import mongoose, { Schema,Document, Types } from "mongoose";




export interface IMedicine{
    name:string;
    dosage:string;
    duration:string;
    time_of_consumption:string;
    consumption_method:string;
}

export interface IPrescription extends Document{
    _id: Types.ObjectId;
    appointmentId : mongoose.Types.ObjectId;
    doctorId:mongoose.Types.ObjectId;
    patientId:mongoose.Types.ObjectId;
    medicines:IMedicine[];
    
    createdAt?:Date

}

const PrescriptionSchema = new Schema<IPrescription>({
    appointmentId:{type:Schema.Types.ObjectId, required:true, ref:"ConsultationAppointment"},
    doctorId:{type:Schema.Types.ObjectId,required:true,ref:"Doctor"},
    patientId:{type:Schema.Types.ObjectId,required:true,ref:"user"},
    medicines:[
        {
            name:{type:String,required:true},
            dosage:{type:String,required:true},
            duration:{type:String,required:true},
            time_of_consumption:{type:String,required:true},
            consumption_method:{type:String,required:true},
        }
    ],
    
})

const Prescription = mongoose.model<IPrescription>(
    "Prescription",
    PrescriptionSchema
)

export default Prescription