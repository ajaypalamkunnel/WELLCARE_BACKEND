import Razorpay from "razorpay";
import { ObjectId } from "mongodb";
import { IDoctorSubscriptionService } from "../../interfaces/doctorSubscriptionService/IDoctorSubscriptionService";
import IDoctorSubscriptionsRepository from "../../../repositories/interfaces/doctorSubscriptions/IDoctorSubscriptions";
import { RazorpayOrderResponse } from "../../../types/razorpayTypes";
import ISubscriptionRepository from "../../../repositories/interfaces/subscription/ISubscription";
import { generateErrorResponse, generateSuccessResponse } from "../../../utils/response";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import crypto from "crypto";
import { IDoctorSubscription } from "../../../model/subscription/doctorSubscriptions";
import IDoctorRepository from "../../../repositories/interfaces/doctor/IDoctor";
import DoctorSubscriptionRepository from "../../../repositories/implementation/doctorSubscriptions/DoctorSubscriptions";



class DoctorSubscriptionService implements IDoctorSubscriptionService {

    private _doctorSubscriptionRepo: IDoctorSubscriptionsRepository;
    private _razorpay: Razorpay;
    private _subscriptionRepo: ISubscriptionRepository;
    private _doctorRepository: IDoctorRepository


    constructor(doctorSubscriptionRepo: IDoctorSubscriptionsRepository, subscriptionRepo: ISubscriptionRepository, doctorRepository: IDoctorRepository) {
        this._doctorSubscriptionRepo = doctorSubscriptionRepo;
        this._subscriptionRepo = subscriptionRepo;
        this._doctorRepository = doctorRepository
        this._razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
    }
   


    async createSubscriptionOrder(doctorId: string, planId: string): Promise<RazorpayOrderResponse> {
        try {

            const activeSubscription = await this._doctorSubscriptionRepo.findActiveSubscription(doctorId)

            if (activeSubscription) {
                const currentDate = new Date()
                if (activeSubscription.endDate && activeSubscription.endDate > currentDate) {
                    throw new CustomError("You already have an active plan. You can subscribe after expiry.", StatusCode.BAD_REQUEST)
                }
            }

            const plan = await this._subscriptionRepo.findById(planId);

            if (!plan) {
                throw new CustomError("Subscription plan not found", StatusCode.NOT_FOUND);
            }

            const options = {
                amount: plan.finalPrice * 100,
                currency: "INR",
                receipt: `order_rcptid_${doctorId}`,
                payment_capture: 1,
            }

            const order = await this._razorpay.orders.create(options);

            await this._doctorSubscriptionRepo.create({
                doctorId: new ObjectId(doctorId),
                planId: new ObjectId(planId),
                startDate: null, // Start only if payment succeeds
                endDate: null,
                orderId: order.id,
                status: "pending",
                paymentStatus: "pending"
            })

            return {
                success: true,
                message: "Order created",
                data: {
                    orderId: order.id,
                    amount: Number(options.amount), // Ensure it's always a number
                    currency: options.currency,
                    key: process.env.RAZORPAY_KEY_ID || "", // Provide a default value
                    plan: {
                        _id: plan._id ? plan._id.toString() : "",
                        planName: plan.planName,
                        finalPrice: plan.finalPrice,
                        duration: {
                            value: plan.duration.value,
                            unit: plan.duration.unit
                        },
                        serviceLimit: plan.serviceLimit,
                    },
                }
            };

        } catch (error) {
            console.error("Error creating Razorpay order:", error);

            // Handle errors by returning a valid RazorpayOrderResponse
            if (error instanceof CustomError) {
                return {
                    success: false,
                    message: error.message,
                    data: {
                        orderId: "",
                        amount: 0,
                        currency: "INR",
                        key: "",
                        plan: {
                            _id: "",
                            planName: "",
                            finalPrice: 0,
                            duration: { value: 0, unit: "month" },
                            serviceLimit: 0
                        }
                    }
                };
            }

            return {
                success: false,
                message: "Internal Server Error",
                data: {
                    orderId: "",
                    amount: 0,
                    currency: "INR",
                    key: "",
                    plan: {
                        _id: "",
                        planName: "",
                        finalPrice: 0,
                        duration: { value: 0, unit: "month" },
                        serviceLimit: 0
                    }
                }
            };
        }
    }

    async verifyPayment(paymentData: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }): Promise<{ success: boolean; message: string; data?: IDoctorSubscription; }> {
        try {

            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
                .update(paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id)
                .digest("hex");

            if (expectedSignature !== paymentData.razorpay_signature) {
                throw new Error("Payment signature verification failed");
            }

            const payment = await this._razorpay.payments.fetch(paymentData.razorpay_payment_id);

            if (payment.status === "captured") {

                const subscription = await this._doctorSubscriptionRepo.findByOrderId(paymentData.razorpay_order_id);

                if (!subscription) {
                    throw new CustomError("Subscription not found", StatusCode.NOT_FOUND);
                }

                const plan = await this._subscriptionRepo.findById(subscription.planId.toString());

                if (!plan) {
                    throw new CustomError("Subscription plan not found", StatusCode.NOT_FOUND);
                }

                const endDate = new Date();
                if (plan.duration.unit === "day") {
                    endDate.setDate(endDate.getDate() + plan.duration.value);
                } else if (plan.duration.unit === "month") {
                    endDate.setMonth(endDate.getMonth() + plan.duration.value);
                } else if (plan.duration.unit === "year") {
                    endDate.setFullYear(endDate.getFullYear() + plan.duration.value);
                }


                const updatedSubscription = await this._doctorSubscriptionRepo.updateByOrderId(paymentData.razorpay_order_id, {
                    paymentStatus: "paid",
                    status: "active",
                    startDate: new Date(),
                    endDate: endDate,
                });

                if (!updatedSubscription) {
                    throw new CustomError("Failed to update subscription", StatusCode.INTERNAL_SERVER_ERROR);
                }

                const updateDoctorSubscription = await this._doctorRepository.update(subscription.doctorId.toString(), { currentSubscriptionId: updatedSubscription?._id, subscriptionExpiryDate: updatedSubscription?.endDate!, isSubscribed: true })


                if (!updateDoctorSubscription) {
                    throw new CustomError("Failed to update doctor subscription", StatusCode.INTERNAL_SERVER_ERROR);

                }


                return generateSuccessResponse("Payment verified and subscription activated", updatedSubscription);
            } else {

                await this._doctorSubscriptionRepo.updateByOrderId(paymentData.razorpay_order_id, {
                    paymentStatus: "failed",
                    status: "canceled",
                });

                return generateErrorResponse("Payment failed. Please try again.");

            }

        } catch (error) {
            console.error("Error verifying payment:", error);
            if (error instanceof CustomError) {
                return generateErrorResponse(error.message, error.statusCode);
            }
            return generateErrorResponse("Internal Server Error", StatusCode.INTERNAL_SERVER_ERROR);

        }
    }

    //razropay order creation


    async getDoctorSubscription(subscriptionId: string): Promise<IDoctorSubscription | null> {
        try {

            if(!subscriptionId){
                throw new CustomError("Subscription ID is required",StatusCode.BAD_REQUEST)
            }

            const mySubscription = await this._doctorSubscriptionRepo.findSubscriptionById(subscriptionId)

            if(!mySubscription){
                throw new CustomError("Subscrition not found",StatusCode.NOT_FOUND)
            }

            return mySubscription
            
        } catch (error) {

            console.error("service : Error fethcing doctor subscription ",error);

            throw error
            
        }
    }




}


export default DoctorSubscriptionService