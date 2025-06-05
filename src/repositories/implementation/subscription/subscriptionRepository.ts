import Subscription, {
    ISubscription,
} from "../../../model/subscription/subscriptionModel";
import { BaseRepository } from "../../base/BaseRepository";
import ISubscriptionRepository from "../../interfaces/subscription/ISubscription";

class SubscriptionRepositroy
    extends BaseRepository<ISubscription>
    implements ISubscriptionRepository {
    constructor() {
        super(Subscription);
    }
    async findSubscriptionPlanByName(
        planName: string
    ): Promise<ISubscription | null> {
        return await Subscription.findOne({ planName });
    }

    async getAllActivePlans(): Promise<ISubscription[]> {
        return await Subscription.find({ status: true }).sort({ finalPrice: 1 });
    }
    async getAllSubscriptionsPaginated(page: number, limit: number): Promise<{data:ISubscription[],totalCount:number}> {
        const skip = (page-1) * limit

        const [data,totalCount] = await Promise.all([
            Subscription.find().skip(skip).limit(limit),
            Subscription.countDocuments()
        ])
       return {data,totalCount}
    }
}

export default SubscriptionRepositroy;
