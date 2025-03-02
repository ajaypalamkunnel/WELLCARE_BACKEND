import mongoose,{Schema,Document, ObjectId} from "mongoose";


export interface IAdmin extends Document{
    _id:ObjectId;
    email:string;
    password:string
}

const AdminSchema = new Schema<IAdmin>({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true}
})

 const Admin = mongoose.model<IAdmin>("Admin",AdminSchema)

 export default Admin