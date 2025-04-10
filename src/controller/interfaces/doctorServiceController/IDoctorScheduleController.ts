import { Request, Response } from "express";



export interface IDoctorScheduleController{
    validateSchedule(req:Request,res:Response):Promise<Response>
    generateSlot(req:Request,res:Response):Promise<Response>
    createSchedule(req:Request,res:Response):Promise<Response>
    listSchedules(req: Request, res: Response):Promise<Response>
    
}