import { Request, Response } from "express";

interface IAdminController {
    login(req: Request, res: Response): Promise<void>;
    fetchAllDoctors(req: Request, res: Response): Promise<void>;
    getAllUsers(req: Request, res: Response): Promise<void>;
    updateDoctorStatus(req: Request, res: Response): Promise<void>;
    viewDoctorDocument(req: Request, res: Response): Promise<void>;
}

export default IAdminController;
