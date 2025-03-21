import { Request, Response } from "express";

export interface IDoctorSubscriptionController {
  createSubscriptionOrder(req: Request, res: Response): Promise<Response>;
  verifyPayment(req: Request, res: Response): Promise<Response>;
}
