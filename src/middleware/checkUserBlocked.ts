import { NextFunction,Request,Response } from "express";
import { User } from "../model/user/userModel";
import { StatusCode } from "../constants/statusCode";

const checkUserBlocked = async (req:Request,res:Response,next:NextFunction):Promise<void>=>{

    try {

        const userId = req.user?.userId

        if(!userId){
             res.status(StatusCode.UNAUTHORIZED).json({error:"Unauthorized access"})
             return

        }

        const user = await User.findById(userId)

        if(!user){
             res.status(StatusCode.NOT_FOUND).json({error:"User not found"})
             return
        }

        if(user.status === -1){
            res.clearCookie("refreshToken",{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"strict",
            })

            res.cookie("auth_token", "",{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"strict",
                expires:new Date(0)
            })

             res.status(StatusCode.FORBIDDEN).json({ error: "Access denied. Your account has been blocked by the admin." });
             return
        }
        

        next()
    } catch (error) {
        console.error("Error in checkUserBlocked middleware:", error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }

}

export default checkUserBlocked;