
import { Request, Response } from "express";
export default interface IPrescriptionController{
    submitPrescription(req: Request, res: Response): Promise<Response>;
    getPrescription(req: Request, res: Response): Promise<Response>;
}