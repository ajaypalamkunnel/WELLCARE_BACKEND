import Razorpay from "razorpay";
import { StatusCode } from "../../../constants/statusCode";
import Subscription, {
    ISubscription,
} from "../../../model/subscription/subscriptionModel";
import ISubscriptionRepository from "../../../repositories/interfaces/subscription/ISubscription";
import { RazorpayOrderResponse } from "../../../types/razorpayTypes";
import { CustomError } from "../../../utils/CustomError";
import { ISubscriptionService } from "../../interfaces/Subscription/ISubscription";

class SubscriptionService implements ISubscriptionService {
    private _subscriptionRepository: ISubscriptionRepository;

    constructor(subscriptionRepository: ISubscriptionRepository) {
        this._subscriptionRepository = subscriptionRepository;
    }

    async createsubscriptionPlan(data: ISubscription): Promise<ISubscription> {
        try {
            const {
                planName,
                duration,
                price,
                discount,
                finalPrice,
                serviceLimit,
                status,
                features,
            } = data;

            if (
                !planName ||
                !duration ||
                !price ||
                !discount ||
                !finalPrice ||
                !serviceLimit ||
                !status ||
                !features ||
                features.length === 0
            ) {
                throw new CustomError("Missing required fields", 400);
            }

            const existingPlan =
                await this._subscriptionRepository.findSubscriptionPlanByName(planName);
            if (existingPlan) {
                throw new CustomError("Plan with this name already exists", 400);
            }

            if (finalPrice > price) {
                throw new CustomError(
                    "Final price cannot be greater than the original price",
                    400
                );
            }

            const newSubscriptionPlan = await this._subscriptionRepository.create(
                data
            );

            if (!newSubscriptionPlan) {
                throw new CustomError(
                    "Failed to create subscription plan",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }

            return newSubscriptionPlan;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error; // Re-throw known custom errors
            }
            console.error(error);

            throw new CustomError(
                "Internal Server Error",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
    async getSubscriptionPlans(): Promise<ISubscription[]> {
        try {
            const subscriptionPlans = await this._subscriptionRepository.findAll();

            if (!subscriptionPlans || subscriptionPlans.length === 0) {
                throw new CustomError(
                    "No subscription plans found",
                    StatusCode.NOT_FOUND
                );
            }

            console.log("----->", subscriptionPlans);

            return subscriptionPlans;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(
                "Failed to retrieve subscriptions",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async toggleSubscriptionStatus(planId: string): Promise<ISubscription> {
        try {
            if (!planId) {
                throw new CustomError("Plan ID is required", 400);
            }

            const plan = await this._subscriptionRepository.findById(planId);
            if (!plan) {
                throw new CustomError(
                    "Subscription plan not found",
                    StatusCode.NOT_FOUND
                );
            }

            plan.status = !plan.status;

            await plan.save();

            console.error(
                `Subscription plan ${plan.status ? "unblocked" : "blocked"}: ${planId}`
            );
            return plan;
        } catch (error) {
            console.error(
                `Error updating subscription plan status: ${(error as Error).message}`
            );
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(
                "Failed to update status",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async updateSubscriptionPlan(
        planId: string,
        updatedData: Partial<ISubscription>
    ): Promise<ISubscription> {
        console.log("Plan ID service:", planId);
        console.log("Updated Data service:", updatedData);

        try {
            const existingPlan = await this._subscriptionRepository.findById(planId);
            if (!existingPlan) {
                throw new CustomError("Subscription plan not found", 404);
            }

            const updatedPlanData = {
                planName: updatedData.planName || existingPlan.planName,
                duration: updatedData.duration || existingPlan.duration,
                price: updatedData.price ?? existingPlan.price,
                discount: updatedData.discount || existingPlan.discount,
                finalPrice:
                    updatedData.discount && updatedData.price
                        ? updatedData.discount.type === "amount"
                            ? updatedData.price - updatedData.discount.amount
                            : updatedData.price -
                            (updatedData.price * updatedData.discount.amount) / 100
                        : existingPlan.finalPrice,
                serviceLimit: updatedData.serviceLimit ?? existingPlan.serviceLimit,
                status: updatedData.status ?? existingPlan.status,
                features: Array.isArray(updatedData.features)
                    ? updatedData.features.every(
                        (f) => typeof f === "object" && "name" in f
                    )
                        ? (updatedData.features as { name: string }[]).map(
                            (feature) => feature.name
                        )
                        : (updatedData.features as string[])
                    : existingPlan.features,

                updatedAt: new Date(), // Update timestamp
            };

            const updatedPlan = await this._subscriptionRepository.update(
                planId,
                updatedPlanData
            );

            if (!updatedPlan) {
                throw new CustomError("Failed to update subscription plan", 500);
            }

            return updatedPlan;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }

            console.error("Error updating subscription plan:", error);
            throw new CustomError("Internal Server Error", 500);
        }
    }

    async getAllSubscriptionPlans(): Promise<ISubscription[]> {
        try {
            const plans = await this._subscriptionRepository.getAllActivePlans();

            if (!plans || plans.length === 0) {
                throw new CustomError("No active subscription plans available", 404);
            }

            return plans;
        } catch (error) {
            console.error("Error fetching all subscription plans:", error);
            throw new CustomError("Failed to fetch subscription plans", 500);
        }
    }
}

export default SubscriptionService;
