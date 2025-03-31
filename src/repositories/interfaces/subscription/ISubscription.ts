import { ISubscription } from "../../../model/subscription/subscriptionModel";
import { IBaseRepository } from "../../base/IBaseRepository";

export default interface ISubscriptionRepository extends IBaseRepository<ISubscription>{

    findSubscriptionPlanByName(planName:string):Promise<ISubscription | null>
    getAllActivePlans(): Promise<ISubscription[]>;
    
    
}