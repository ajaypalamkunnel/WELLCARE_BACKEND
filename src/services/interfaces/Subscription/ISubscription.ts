import { ISubscription } from "../../../model/subscription/subscriptionModel";
import { RazorpayOrderResponse } from "../../../types/razorpayTypes";

export interface ISubscriptionService {
    createsubscriptionPlan(data: ISubscription): Promise<ISubscription>;
    getSubscriptionPlans(): Promise<ISubscription[]>;
    toggleSubscriptionStatus(planId: string): Promise<ISubscription>;
    updateSubscriptionPlan(
        planId: string,
        updatedData: Partial<ISubscription>
    ): Promise<ISubscription>;
    getAllSubscriptionPlans(): Promise<ISubscription[]>;
}
