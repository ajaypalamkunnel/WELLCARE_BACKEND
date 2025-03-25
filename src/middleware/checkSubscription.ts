import { Request,Response,NextFunction } from "express";
import Doctor from "../model/doctor/doctorModel";
import { StatusCode } from "../constants/statusCode";



const checkSubscription = async (req:Request,res:Response,next:NextFunction):Promise<void>  =>{

    try {

        const doctorId = req.user?.userId

        if(!doctorId){
             res.status(StatusCode.UNAUTHORIZED).json({ error: "Unauthorized access" });
             return
        }

        const doctor = await Doctor.findById(doctorId)

        if(!doctor){
             res.status(StatusCode.NOT_FOUND).json({error:"Doctor not found"})
             return
        }

        if(!doctor.isSubscribed || (doctor.subscriptionExpiryDate &&  doctor.subscriptionExpiryDate < new Date())){
             res.status(StatusCode.FORBIDDEN).json({
                error:"Subscription expired. Please renew your subscription."
            })
            return
        }

        next()
        
    } catch (error) {
        console.error("Error in checkSubscription middleware:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }

}

export default checkSubscription