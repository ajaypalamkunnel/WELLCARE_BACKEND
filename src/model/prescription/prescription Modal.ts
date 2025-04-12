import mongoose, { Schema } from "mongoose";




export interface IMedicine{
    name:string;
    dosage:string;
    duration:string;
    time_of_consumption:string;
    consumption_method:string;
}

export interface IPrescription extends Document{
    appoinmentId : mongoose.Types.ObjectId;
    doctorId:mongoose.Types.ObjectId;
    patientId:mongoose.Types.ObjectId;
    medicines:IMedicine[];
    notes?:string,
    createdAt?:Date

}

const PrescriptionSchema = new Schema<IPrescription>({
    appoinmentId:{type:Schema.Types.ObjectId, required:true, ref:"ConsultationAppointment"},
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
    notes:{type:String},
})

const Prescription = mongoose.model<IPrescription>(
    "Prescription",
    PrescriptionSchema
)

export default Prescription