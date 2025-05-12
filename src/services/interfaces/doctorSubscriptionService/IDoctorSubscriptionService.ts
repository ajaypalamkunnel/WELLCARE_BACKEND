import { IDoctorSubscription } from "../../../model/subscription/doctorSubscriptions";
import { RazorpayOrderResponse } from "../../../types/razorpayTypes";

export interface IDoctorSubscriptionService {
  createSubscriptionOrder(
    doctorId: string,
    planId: string
  ): Promise<RazorpayOrderResponse>;

  verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: IDoctorSubscription;
  }>;

  getDoctorSubscription(
    subscriptionId: string
  ): Promise<IDoctorSubscription | null>;
}
