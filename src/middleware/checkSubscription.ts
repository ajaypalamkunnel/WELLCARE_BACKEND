import { Request,Response,NextFunction } from "express";
import Doctor from "../model/doctor/doctorModel";
import { StatusCode } from "../constants/statusCode";



const checkSubscription = async (req:Request,res:Response,next:NextFunction) =>{

    try {

        const doctorId = req.user?.userId

        if(!doctorId){
            return res.status(StatusCode.UNAUTHORIZED).json({ error: "Unauthorized access" });
        }

        const doctor = await Doctor.findById(doctorId)

        if(!doctor){
            return res.status(StatusCode.NOT_FOUND).json({error:"Doctor not found"})
        }

        if(!doctor.isSubscribed || (doctor.subscriptionExpiryDate &&  doctor.subscriptionExpiryDate < new Date())){
            return res.status(StatusCode.FORBIDDEN).json({
                error:"Subscription expired. Please renew your subscription."
            })
        }

        next()
        
    } catch (error) {
        console.error("Error in checkSubscription middleware:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }

}

export default checkSubscription