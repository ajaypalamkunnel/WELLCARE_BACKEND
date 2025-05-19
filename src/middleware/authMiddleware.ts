import { Request,Response,NextFunction } from "express";
import JwtUtils from "../utils/jwtUtils";


interface UserPayload {
    userId: string;
    email: string;
    token?:string;
    role?:string
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
        
        
        next()
    } catch (error) {
      
        console.error("Invalid token",error);
         res.status(403).json({ error: "Invalid token" })
         return
    }
}

export default authMiddleWare;