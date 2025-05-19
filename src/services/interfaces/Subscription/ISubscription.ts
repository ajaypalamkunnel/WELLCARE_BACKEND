import { ISubscription } from "../../../model/subscription/subscriptionModel";


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
