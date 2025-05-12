import { IDoctorSubscription } from "../../../model/subscription/doctorSubscriptions";
import { IBaseRepository } from "../../base/IBaseRepository";

export default interface IDoctorSubscriptionsRepository
    extends IBaseRepository<IDoctorSubscription> {
    findByOrderId(orderId: string): Promise<IDoctorSubscription | null>;
    updateByOrderId(
        orderId: string,
        updateData: Partial<IDoctorSubscription>
    ): Promise<IDoctorSubscription | null>;
    findActiveSubscription(doctorId: string): Promise<IDoctorSubscription | null>;
    findSubscriptionById(
        susbscriptionID: string
    ): Promise<IDoctorSubscription | null>;
}
