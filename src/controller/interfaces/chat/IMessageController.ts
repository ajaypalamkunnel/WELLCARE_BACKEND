
import { Request,Response } from "express";

export interface IMessageController{

    getChatHistory(req: Request, res: Response): Promise<Response>
    getUserInbox(req: Request, res: Response): Promise<Response>
    getDoctorInbox(req: Request, res: Response): Promise<Response>

}