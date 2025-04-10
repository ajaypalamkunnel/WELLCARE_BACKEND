import { Request,Response } from "express";


export interface IConsultationBookingController{
    initiateAppointment(req: Request, res: Response):Promise<Response>
    verifyAppointment(req: Request, res: Response):Promise<Response>
    fetchBookingDetails(req:Request,res:Response):Promise<Response>
    getUserAppointments(req: Request, res: Response): Promise<Response>;

}


export default IConsultationBookingController