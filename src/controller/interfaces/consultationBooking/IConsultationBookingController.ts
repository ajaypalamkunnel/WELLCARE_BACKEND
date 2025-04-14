import { Request,Response } from "express";


export interface IConsultationBookingController{
    initiateAppointment(req: Request, res: Response):Promise<Response>
    verifyAppointment(req: Request, res: Response):Promise<Response>
    fetchBookingDetails(req:Request,res:Response):Promise<Response>
    getUserAppointments(req: Request, res: Response): Promise<Response>;
    getAppointmentDetail(req: Request, res: Response): Promise<Response>;
    cancelAppointment(req: Request, res: Response):Promise<Response>
    listAppointments(req: Request, res: Response): Promise<Response>;
    getAppointmentDetailForDoctor(req: Request, res: Response): Promise<Response>;
}


export default IConsultationBookingController