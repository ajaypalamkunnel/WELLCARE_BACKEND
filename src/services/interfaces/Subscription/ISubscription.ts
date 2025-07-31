import { SubscriptionDTO } from "../../../dto/subscriptionDto/subscription.dto";
import { ISubscription } from "../../../model/subscription/subscriptionModel";


export interface ISubscriptionService {
    createsubscriptionPlan(data: ISubscription): Promise<ISubscription>;
    getSubscriptionPlans(page:number,limit:number): Promise<ISubscription[]>;
    toggleSubscriptionStatus(planId: string): Promise<ISubscription>;
    updateSubscriptionPlan(
        planId: string,
        updatedData: Partial<ISubscription>
    ): Promise<ISubscription>;
    getAllSubscriptionPlans(): Promise<SubscriptionDTO[]>;
    getAllSubscriptionPlansPaginated(page:number,limit:number): Promise<{data :ISubscription[],totalPages:number,currentPage:number}>;


}
