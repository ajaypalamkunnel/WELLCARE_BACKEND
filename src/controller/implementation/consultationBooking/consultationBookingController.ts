import { Request, Response } from "express";
import IConsultationBookingController from "../../interfaces/consultationBooking/IConsultationBookingController";
import IConsultationBookingService from "../../../services/interfaces/consultationBooking/IConsultationBookingService";
import { StatusCode } from "../../../constants/statusCode";
import { generateErrorResponse, generateSuccessResponse } from "../../../utils/response";
import { CustomError } from "../../../utils/CustomError";
import { SlotStatus } from "../../../model/doctorService/doctorSchedule";



class ConsultationBookingController implements IConsultationBookingController {


    private _consultationBookingController: IConsultationBookingService

    constructor(consultationBookingController: IConsultationBookingService) {
        this._consultationBookingController = consultationBookingController
    }
    
    
    async fetchBookingDetails(req: Request, res: Response): Promise<Response> {

        try {

            const { bookingId, slotId } = req.query

            if (!bookingId || !slotId) {
                throw new CustomError("All fields are required", StatusCode.BAD_REQUEST)
            }

            const result = await this._consultationBookingController.getBookingDetails(bookingId as string, slotId as string)

            if (!result) {
                throw new CustomError("Booking not found", StatusCode.NOT_FOUND)
            }

            return res.status(StatusCode.OK).json(generateSuccessResponse("Booking data fetched successfuully", result))

        } catch (error) {
            console.error("Featch booking details controller", error);


            return res.status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR).json(generateErrorResponse(error instanceof CustomError ? error.message : "Internal server error"))

        }


    }



    async initiateAppointment(req: Request, res: Response): Promise<Response> {

        try {

            console.log("initiate --->", req.body);

            const result = await this._consultationBookingController.initiateBooking(req.body)

            return res.status(StatusCode.OK).json(generateSuccessResponse("Order created", result))

        } catch (error) {

            console.error("Error in initiateAppointment controller: ", error);


            return res.status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR)
                .json(generateErrorResponse(error instanceof CustomError ? error.message : "Internal server error"))



        }

    }
    async verifyAppointment(req: Request, res: Response): Promise<Response> {
        try {
            
            const result = await this._consultationBookingController.verifyAndBook(req.body);

            return res.status(StatusCode.CREATED).json(generateSuccessResponse("Appointment booked", result))

        } catch (error) {
            
            console.error("Error verifing payment controller: ", error);


            return res.status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR)
            .json(generateErrorResponse(error instanceof CustomError ? error.message : "Internal server error"))

            
        }
    }
    
    async getUserAppointments(req: Request, res: Response): Promise<Response> {
        try {

            const patientId = req.user?.userId

            if(!patientId){
                throw new CustomError("Unauthorized access", StatusCode.UNAUTHORIZED);
            }

            const statusKey = (req.query.status as SlotStatus)?.toLowerCase() || "upcoming";
            const validStatus = ["upcoming", "completed", "cancelled"];
            if (!validStatus.includes(statusKey)) {
              throw new CustomError("Invalid status filter", StatusCode.BAD_REQUEST);
            }


            const appoinments = await this._consultationBookingController.getUserAppointments(patientId,statusKey as SlotStatus)

            return res.status(StatusCode.OK).json(generateSuccessResponse("Appointments fetched successfully",appoinments))
           
        } catch (error) {

            return res.status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR)
            .json(error instanceof CustomError ? error.statusCode : "Internal server Error")
            
        }
    }
}



export default ConsultationBookingController