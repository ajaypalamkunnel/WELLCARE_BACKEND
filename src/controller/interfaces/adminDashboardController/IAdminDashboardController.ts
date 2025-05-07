

import { Request, Response } from "express";

interface IAdminDashboardController{

    getOverView(req: Request, res: Response): Promise<Response>;
    getRevenueTrend(req: Request, res: Response): Promise<Response>;
    getPlanDistribution(req: Request, res: Response): Promise<Response>
    downloadSubscriptionReport(req: Request, res: Response): Promise<Response>
    getDoctorAnalyticsSummary(req: Request, res: Response): Promise<Response>
    getDoctorRevenueTrend(req: Request, res: Response): Promise<Response> 
    getServiceRevenue(req: Request, res: Response): Promise<Response>
    getTopPerformingDoctors(req: Request, res: Response): Promise<Response>
}

export default IAdminDashboardController