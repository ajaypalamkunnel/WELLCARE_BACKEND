import { NextFunction } from "express";
import { StatusCode } from "../constants/statusCode";
import { Response,Request } from "express";
export function checkRole(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const userRole = req.user?.role;
      console.log("===========>",userRole);
      
      if (userRole === requiredRole) {
        next();
      } else {
        res.status(StatusCode.FORBIDDEN).json({message:`Forbidden: ${requiredRole} access reqired`})
      }
    };
  }