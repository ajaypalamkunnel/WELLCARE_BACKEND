import Subscription,{ISubscription} from "../../../model/subscription/subscriptionModel";
import { BaseRepository } from "../../base/BaseRepository";
import ISubscriptionRepository from "../../interfaces/subscription/ISubscription";

class SubscriptionRepositroy extends BaseRepository<ISubscription> implements ISubscriptionRepository{
    constructor(){
        super(Subscription)
    }
    async findSubscriptionPlanByName(planName: string): Promise<ISubscription | null> {
        return await Subscription.findOne({planName})
    }

    
    

}

export default SubscriptionRepositroy