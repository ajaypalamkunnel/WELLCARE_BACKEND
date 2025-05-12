import { Request, Response } from "express";

interface IDoctorDashboardController {
    getAppointmentSummary(req: Request, res: Response): Promise<Response>;

    getAppointmentTrend(req: Request, res: Response): Promise<Response>;

    getRevenueTrend(req: Request, res: Response): Promise<Response>;

    getTopServices(req: Request, res: Response): Promise<Response>;

    generateDoctorReport(req: Request, res: Response): Promise<Response>;
}

export default IDoctorDashboardController;
