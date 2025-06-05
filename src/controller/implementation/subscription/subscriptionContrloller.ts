import { Request, Response } from "express";
import { ISubscriptionService } from "../../../services/interfaces/Subscription/ISubscription";
import { ISubscriptionController } from "../../interfaces/subscription/ISubscriptionController";
import { ISubscription } from "../../../model/subscription/subscriptionModel";
import {
    generateErrorResponse,
    generateSuccessResponse,
} from "../../../utils/response";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import { handleControllerError } from "../../../utils/controllerErrorHandler";

class SubscriptionController implements ISubscriptionController {
    private _subscriptionService: ISubscriptionService;

    constructor(subscriptionService: ISubscriptionService) {
        this._subscriptionService = subscriptionService;
    }

    async createsubscriptionPlan(req: Request, res: Response): Promise<Response> {
        try {
            const { subscriptionData } = req.body;

            if (!subscriptionData) {
                throw new CustomError("Invalid request data", 400);
            }


            //  Validate required fields
            const {
                planName,
                duration,
                price,
                discount,
                serviceLimit,
                status,
                features,
            } = subscriptionData;

            if (
                !planName ||
                !duration?.value ||
                !duration?.unit ||
                !price ||
                !serviceLimit ||
                status === undefined ||
                !Array.isArray(features) ||
                features.length === 0
            ) {
                throw new CustomError("Missing required fields", 400);
            }

            //  Format the data correctly for insertion
            const formattedPrice = Number(price);
            const formattedServiceLimit = Number(serviceLimit);
            const formattedDiscount = discount
                ? {
                    amount: Number(discount.amount),
                    type: discount.type as "percentage" | "amount",
                }
                : undefined;

            // Format features array correctly (extract only names)
            const formattedFeatures = features.map(
                (feature: { name: string }) => feature.name
            );

            //  Calculate final price correctly
            const finalPrice = formattedDiscount
                ? formattedDiscount.type === "amount"
                    ? formattedPrice - formattedDiscount.amount
                    : formattedPrice - (formattedPrice * formattedDiscount.amount) / 100
                : formattedPrice;

            //  Construct the final formatted data
            const formattedData = {
                planName,
                duration: {
                    value: Number(duration.value),
                    unit: duration.unit as "day" | "month" | "year",
                },
                price: formattedPrice,
                discount: formattedDiscount,
                finalPrice,
                serviceLimit: formattedServiceLimit,
                status: Boolean(status),
                features: formattedFeatures,
            } as ISubscription;

            const newSubscriptionPlan =
                await this._subscriptionService.createsubscriptionPlan(formattedData);
            return res
                .status(StatusCode.CREATED)
                .json(
                    generateSuccessResponse(
                        "subscription plan created successfully",
                        newSubscriptionPlan
                    )
                );
        } catch (error: unknown) {
          if(error instanceof CustomError){
            throw error
          }else{
            throw new CustomError("Internal server error",StatusCode.INTERNAL_SERVER_ERROR)
          }
        }
    }

    async getSubscriptionPlans(req: Request, res: Response): Promise<Response> {
        try {

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10


            const subscriptionPlans =
                await this._subscriptionService.getAllSubscriptionPlansPaginated(page,limit);

            

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "subscription plans fetched successfully",
                        subscriptionPlans
                    )
                );
        } catch (error: unknown) {
            return handleControllerError(res, error);
        }
    }

    async toggleSubscriptionStatus(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const { planId } = req.body;

            if (!planId) {
                throw new CustomError("Plan ID is required", 400);
            }

            const updatedPlan =
                await this._subscriptionService.toggleSubscriptionStatus(planId);

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        `Subscription plan ${updatedPlan.status ? "unblocked" : "blocked"
                        } successfully`,
                        updatedPlan
                    )
                );
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "An unexpected error occurred";
            const statusCode = error instanceof CustomError ? error.statusCode : 500;

            console.error(`Error updating subscription plan status: ${errorMessage}`);
            return res
                .status(statusCode)
                .json(generateErrorResponse(errorMessage, statusCode));
        }
    }

    async updateSubscriptionPlan(req: Request, res: Response): Promise<Response> {
        try {
            const { planId, updatedData } = req.body;

            if (!planId) {
                throw new CustomError("Plan ID is required", 400);
            }

            const updatedPlan = this._subscriptionService.updateSubscriptionPlan(
                planId,
                {
                    ...updatedData,
                    features:
                        updatedData.features?.map(
                            (feature: { name: string }) => feature.name
                        ) || [],
                }
            );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Subscription plan updated successfully",
                        updatedPlan
                    )
                );
        } catch (error: unknown) {
            console.error("Error updating subscription plan:", error);

            return res
                .status(error instanceof CustomError ? error.statusCode : 500)
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal Server Error"
                    )
                );
        }
    }

    async getAllSubscriptionPlans(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const plans = await this._subscriptionService.getAllSubscriptionPlans();

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Subscription plans fetched successfully",
                        plans
                    )
                );
        } catch (error) {
            console.error("Error fetching subscription plans:", error);

            return res
                .status(
                    error instanceof Error
                        ? StatusCode.INTERNAL_SERVER_ERROR
                        : StatusCode.BAD_REQUEST
                )
                .json(
                    generateErrorResponse(
                        error instanceof Error ? error.message : "Internal Server Error"
                    )
                );
        }
    }
}

export default SubscriptionController;
