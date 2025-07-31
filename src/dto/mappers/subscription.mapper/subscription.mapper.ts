import { ISubscription } from "../../../model/subscription/subscriptionModel";
import { SubscriptionDTO } from "../../subscriptionDto/subscription.dto";


export const mapSubscriptionToDTO = (subscription: ISubscription): SubscriptionDTO => {
  return {
    _id: subscription._id.toString(),
    planName: subscription.planName,
    duration: {
      value: subscription.duration.value,
      unit: subscription.duration.unit,
    },
    price: subscription.price,
    discount: subscription.discount,
    finalPrice: subscription.finalPrice,
    serviceLimit: subscription.serviceLimit,
    features: subscription.features,
    status: subscription.status,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  };
};
