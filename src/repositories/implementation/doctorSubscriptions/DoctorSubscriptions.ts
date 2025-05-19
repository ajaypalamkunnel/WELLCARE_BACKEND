import DoctorSubscription, {
    IDoctorSubscription,
} from "../../../model/subscription/doctorSubscriptions";
import { ISubscription } from "../../../model/subscription/subscriptionModel";
import { BaseRepository } from "../../base/BaseRepository";
import IDoctorSubscriptionsRepository from "../../interfaces/doctorSubscriptions/IDoctorSubscriptions";
import mongoose from "mongoose";

class DoctorSubscriptionRepository
    extends BaseRepository<IDoctorSubscription>
    implements IDoctorSubscriptionsRepository {
    constructor() {
        super(DoctorSubscription);
    }

    async findByOrderId(orderId: string): Promise<IDoctorSubscription | null> {
        return await DoctorSubscription.findOne({ orderId });
    }
    async updateByOrderId(
        orderId: string,
        updateData: Partial<IDoctorSubscription>
    ): Promise<IDoctorSubscription | null> {
        return await DoctorSubscription.findOneAndUpdate({ orderId }, updateData, {
            new: true,
        });
    }

    async findActiveSubscription(
        doctorId: string
    ): Promise<IDoctorSubscription | null> {
        return await DoctorSubscription.findOne({
            doctorId: new mongoose.Types.ObjectId(doctorId),
            status: "active",
            endDate: { $gte: new Date() },
        }).populate<{ planId: ISubscription }>(
            "planId",
            "serviceLimit planName duration price"
        );
    }

    async findSubscriptionById(
        susbscriptionID: string
    ): Promise<IDoctorSubscription | null> {
        return await DoctorSubscription.findById(susbscriptionID).populate(
            "planId"
        );
    }
}

export default DoctorSubscriptionRepository;
