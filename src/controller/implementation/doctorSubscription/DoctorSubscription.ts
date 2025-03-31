import { Request, Response } from "express";
import { IDoctorSubscriptionService } from "../../../services/interfaces/doctorSubscriptionService/IDoctorSubscriptionService";
import { IDoctorSubscriptionController } from "../../interfaces/doctorSubscription/IDoctorSubscription";
import { StatusCode } from "../../../constants/statusCode";
import { CustomError } from "../../../utils/CustomError";
import { generateErrorResponse, generateSuccessResponse } from "../../../utils/response";




class DoctorSubscriptionController implements IDoctorSubscriptionController {

    private _doctorSubscriptionService: IDoctorSubscriptionService

    constructor(doctorSubscriptionService: IDoctorSubscriptionService) {
        this._doctorSubscriptionService = doctorSubscriptionService
    }
    
    async createSubscriptionOrder(req: Request, res: Response): Promise<Response> {
        try {

            const { doctorId, planId } = req.body;

            if (!doctorId || !planId) {
                throw new CustomError("Invalid request data", StatusCode.BAD_REQUEST);
            }


            const response = await this._doctorSubscriptionService.createSubscriptionOrder(doctorId, planId);

            return res.status(StatusCode.OK).json(response);

        } catch (error) {

            console.error("Error in createSubscriptionOrder:", error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });

        }
    }


    async verifyPayment(req: Request, res: Response): Promise<Response> {
        try {

            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                throw new CustomError("Invalid payment details", StatusCode.BAD_REQUEST);
            }


            const response = await this._doctorSubscriptionService.verifyPayment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            });

            return res.status(response.success ? StatusCode.OK : StatusCode.BAD_REQUEST).json(response);
        } catch (error) {
            console.error("Error in verifyPayment:", error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal Server Error" });

        }
    }


    async getDoctorSubscriptionn(req: Request, res: Response): Promise<Response> {
        try {


            console.log("hiiii getDoctorSubscriptionn");
            

            const {subscriptionId} = req.params

            console.log("subs: ",subscriptionId);
            

            const mySubscription = await this._doctorSubscriptionService.getDoctorSubscription(subscriptionId)

            return res.status(StatusCode.OK).json(generateSuccessResponse("Subscription details retrieved successfully",mySubscription))
            
        } catch (error) {
            console.error("Error fetching subscription details:", error);

           return res.status(error instanceof CustomError ? error.statusCode:StatusCode.INTERNAL_SERVER_ERROR).json(generateErrorResponse(error instanceof CustomError ? error.message : "Internal Server Error"))
            
        }
    }

}


export default DoctorSubscriptionController