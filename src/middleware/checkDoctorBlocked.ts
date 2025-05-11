import { NextFunction,Request,Response } from "express";
import Doctor from "../model/doctor/doctorModel";
import { StatusCode } from "../constants/statusCode";
import { error } from "console";

const checkDoctorBlocked = async (req:Request,res:Response,next:NextFunction) : Promise<void> =>{

    try {

        const doctorId = req.user?.userId;

        if(!doctorId){
             res.status(StatusCode.UNAUTHORIZED).json({message:"Unauthorized access"});
             return
        }

        const doctor = await Doctor.findById(doctorId);

        if(!doctor){
             res.status(StatusCode.NOT_FOUND).json({message:"Doctor not found"});
             return
        }

        if(doctor.status === -1){
            res.clearCookie("doctorRefreshToken",{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"strict"
            })


            res.cookie("doctorAccessToken","",{

                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"strict",
                expires:new Date(0)

            })
            res.status(StatusCode.FORBIDDEN).json({error:"Access denied. Your account has been blocked by the admin." });
            return
        }

        next()
    } catch (error) {
        console.error("Error in checkDoctorBlocked middleware:", error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }

}

export default checkDoctorBlocked;