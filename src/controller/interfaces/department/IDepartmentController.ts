import { Request, Response } from "express";

export interface IDepartmentController {
    createDepartment(req: Request, res: Response): Promise<void>;
    getAllDepatments(req: Request, res: Response): Promise<void>;
    updateDepartmentStatus(req: Request, res: Response): Promise<void>;
    getAllActiveDepartments(req: Request, res: Response): Promise<Response>;
     getAllPaginatedDepatments(req: Request, res: Response): Promise<void>
}
