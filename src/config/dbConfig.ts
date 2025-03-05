import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()


 const connectDB = async ()=>{
    const connection_string = process.env.DB_CONNECTION_STRING

    try {
       await mongoose.connect(`${connection_string}`,{
            dbName:'wellcare'
       })
       console.log("db connected successfully");
    } catch (error) {
        console.log("mongoDB connection error",error);
        
    }
 }

 export default connectDB;