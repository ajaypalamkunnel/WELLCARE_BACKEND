import { Request, Response } from "express";
import IConsultationBookingController from "../../interfaces/consultationBooking/IConsultationBookingController";
import IConsultationBookingService from "../../../services/interfaces/consultationBooking/IConsultationBookingService";
import { StatusCode } from "../../../constants/statusCode";
import {
    generateErrorResponse,
    generateSuccessResponse,
} from "../../../utils/response";
import { CustomError } from "../../../utils/CustomError";
import { SlotStatus } from "../../../model/doctorService/doctorSchedule";
import { Types } from "mongoose";

class ConsultationBookingController implements IConsultationBookingController {
    private _consultationBookingController: IConsultationBookingService;

    constructor(consultationBookingController: IConsultationBookingService) {
        this._consultationBookingController = consultationBookingController;
    }

    async fetchBookingDetails(req: Request, res: Response): Promise<Response> {
        try {
            const { bookingId, slotId } = req.query;

            if (!bookingId || !slotId) {
                throw new CustomError(
                    "All fields are required",
                    StatusCode.BAD_REQUEST
                );
            }

            const result =
                await this._consultationBookingController.getBookingDetails(
                    bookingId as string,
                    slotId as string
                );

            if (!result) {
                throw new CustomError("Booking not found", StatusCode.NOT_FOUND);
            }

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse("Booking data fetched successfuully", result)
                );
        } catch (error) {
            console.error("Featch booking details controller", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server error"
                    )
                );
        }
    }

    async initiateAppointment(req: Request, res: Response): Promise<Response> {
        try {

            const result = await this._consultationBookingController.initiateBooking(
                req.body
            );

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("Order created", result));
        } catch (error) {
            console.error("Error in initiateAppointment controller: ", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server error"
                    )
                );
        }
    }
    async verifyAppointment(req: Request, res: Response): Promise<Response> {
        try {
            const result = await this._consultationBookingController.verifyAndBook(
                req.body
            );

            return res
                .status(StatusCode.CREATED)
                .json(generateSuccessResponse("Appointment booked", result));
        } catch (error) {
            console.error("Error verifing payment controller: ", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server error"
                    )
                );
        }
    }

    async getUserAppointments(req: Request, res: Response): Promise<Response> {
        try {
            const patientId = req.user?.userId;

            if (!patientId) {
                throw new CustomError("Unauthorized access", StatusCode.UNAUTHORIZED);
            }

            const statusKey =
                (req.query.status as SlotStatus)?.toLowerCase() || "upcoming";
            const validStatus = ["upcoming", "completed", "cancelled"];
            if (!validStatus.includes(statusKey)) {
                throw new CustomError("Invalid status filter", StatusCode.BAD_REQUEST);
            }

            const appoinments =
                await this._consultationBookingController.getUserAppointments(
                    patientId,
                    statusKey as SlotStatus
                );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Appointments fetched successfully",
                        appoinments
                    )
                );
        } catch (error) {
            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server error"
                    )
                );
        }
    }

    async getAppointmentDetail(req: Request, res: Response): Promise<Response> {
        try {
            const patientId = req.user?.userId;

            if (!patientId) {
                throw new CustomError("Unauthorized access", StatusCode.UNAUTHORIZED);
            }

            const appointmentIdParam = req.params.id;


            if (!Types.ObjectId.isValid(appointmentIdParam)) {
                throw new CustomError("Invalid appointment ID", StatusCode.BAD_REQUEST);
            }

            const appoinmentId = new Types.ObjectId(appointmentIdParam);
            const patientObjectId = new Types.ObjectId(patientId);

            const detail =
                await this._consultationBookingController.getAppoinmentDetailsById(
                    appoinmentId,
                    patientObjectId
                );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Appoinment details fetched successfully",
                        detail
                    )
                );
        } catch (error) {
            console.error("appoinment details fetch error", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server error"
                    )
                );
        }
    }

    async cancelAppointment(req: Request, res: Response): Promise<Response> {
        try {
            const appoinmentId = req.params.id;
            const reason = req.body.reason;
            const patientId = req.user?.userId;

            if (!patientId) {
                throw new CustomError("Unauthorized", StatusCode.UNAUTHORIZED);
            }

            if (!Types.ObjectId.isValid(appoinmentId)) {
                throw new CustomError("Invalid appointment ID", StatusCode.BAD_REQUEST);
            }

            const result =
                await this._consultationBookingController.cancelAppointment(
                    new Types.ObjectId(patientId),
                    new Types.ObjectId(appoinmentId),
                    reason
                );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Appointment cancelled successfully",
                        result.refund
                    )
                );
        } catch (error) {
            console.error("Controller Error", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server Error"
                    )
                );
        }
    }

    async listAppointments(req: Request, res: Response): Promise<Response> {
        try {
            const doctorId = req.user?.userId;
            const doctorIdObject = new Types.ObjectId(doctorId);

            if (!doctorId) {
                throw new CustomError("Unauthorized access", StatusCode.UNAUTHORIZED);
            }

            const filters = {
                date: req.query.date?.toString(),
                mode: req.query.mode?.toString(),
                status: req.query.status?.toString(),
                page: req.query.page
                    ? parseInt(req.query.page as string, 10)
                    : undefined,
                limit: 10,
            };

            const result =
                await this._consultationBookingController.findAppointmentsForDoctor(
                    doctorIdObject,
                    filters
                );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse("Appointments fetched successfully", result)
                );
        } catch (error) {
            console.log("List appoinments controller error", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server error"
                    )
                );
        }
    }

    async getAppointmentDetailForDoctor(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const doctorId = req.user?.userId;

            if (!doctorId) {
                throw new CustomError("Unauthorized access", StatusCode.UNAUTHORIZED);
            }

            const { appointmentId } = req.params;

            const appointmentDetail =
                await this._consultationBookingController.getAppointmentDetailForDoctor(
                    appointmentId,
                    new Types.ObjectId(doctorId)
                );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Appointment detail fetched",
                        appointmentDetail
                    )
                );
        } catch (error) {
            console.error(" getAppointmentDetailForDoctor error:", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server error"
                    )
                );
        }
    }
}

export default ConsultationBookingController;
