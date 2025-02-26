import mongoose,{Schema,Document} from "mongoose";

export interface IDepartment extends Document{
    name:string;
    icon:string;
    status:boolean;
    createdAt?:Date;
    updatedAt?:Date;
}

const DepartmentSchema = new Schema<IDepartment>(
    {
        name:{type:String,required:true},
        icon:{type:String,required:true},
        status:{type:Boolean,required:true},
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    {timestamps:true}
)

const Department = mongoose.model<IDepartment>("Department",DepartmentSchema)

export default Department