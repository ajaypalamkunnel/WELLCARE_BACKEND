import { Request, Response } from "express";

export interface ISubscriptionController {
    createsubscriptionPlan(req: Request, res: Response): Promise<Response>;
    getSubscriptionPlans(req: Request, res: Response): Promise<Response>;
    toggleSubscriptionStatus(req: Request, res: Response): Promise<Response>;
    updateSubscriptionPlan(req: Request, res: Response): Promise<Response>;
    getAllSubscriptionPlans(req: Request, res: Response): Promise<Response>;
}
