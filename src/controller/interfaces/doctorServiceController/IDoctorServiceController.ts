import { Request, Response } from "express";

export interface IDoctorServiceController{
    createDoctorService(req:Request,res:Response):Promise<Response>
    getDoctorServices(req:Request,res:Response):Promise<Response>
    doctorServiceUpdate(req:Request,res:Response):Promise<Response>

}