import { Request,Response,NextFunction } from "express";
import JwtUtils from "../utils/jwtUtils";
import { error } from "console";

interface UserPayload {
    userId: string;
    email: string;
    token?:string;
  }


  declare module "express-serve-static-core" {
    interface Request {
      user?: UserPayload; // Extend Request with user
    }
  }

const authMiddleWare = (req:Request,res:Response,next:NextFunction):void=>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
         res.status(401).json({error:"Unauthorized"})
         return
    }

    const token = authHeader.split(" ")[1];


    try {
        const decode = JwtUtils.verifyToken(token) as UserPayload;
        req.user = decode
        // console.log("middle ware",req.user);
        
        next()
    } catch (error) {
         res.status(403).json({ error: "Invalid token" })
         return
    }
}

export default authMiddleWare;