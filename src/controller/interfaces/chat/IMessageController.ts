
import { Request,Response } from "express";

export interface IMessageController{

    getChatHistory(req: Request, res: Response): Promise<Response>
    getInbox(req: Request, res: Response): Promise<Response>

}