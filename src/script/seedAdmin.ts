import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/dbConfig";
import { AdminService } from "../services/implementation/admin/AdminService";
import AdminRepository from "../repositories/implementation/admin/adminRepository";

dotenv.config()


const seedAdmin = async ()=>{


    try {
       const adminRepository = new AdminRepository()

        await connectDB();

        const adminService = new AdminService(adminRepository)
        const email = process.env.ADMIN_EMAIL
        const password = process.env.ADMIN_PASSWORD

        const admin = await adminService.createAdmin({email,password})


        if (admin) {
            console.log("✅ Admin user created successfully");
        } else {
            console.log("⚠️ Admin user already exists");
        }

        mongoose.connection.close()
        
    } catch (error) {
        console.error(" Seeding failed:", error);
        process.exit(1);
    }

}

seedAdmin()