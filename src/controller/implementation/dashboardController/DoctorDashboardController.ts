import { Request, Response } from "express";
import IDoctorDashboardController from "../../interfaces/dashboardController/IDoctorDashboardController";
import { CustomError } from "../../../utils/CustomError";
import { ERROR_MESSAGES, StatusCode } from "../../../constants/statusCode";
import IDoctorDashboardService from "../../../services/interfaces/dashboardService/IDoctorDashboardService";
import { Types } from "mongoose";
import {
    generateErrorResponse,
    generateSuccessResponse,
} from "../../../utils/response";

class DoctorDashboardController implements IDoctorDashboardController {
    private _doctorDashboardService: IDoctorDashboardService;

    constructor(doctorDashboarddService: IDoctorDashboardService) {
        this._doctorDashboardService = doctorDashboarddService;
    }

    async getAppointmentSummary(req: Request, res: Response): Promise<Response> {
        try {
            const doctorId = req.user?.userId;

            if (!doctorId) {
                throw new CustomError("Unauthorized access", StatusCode.FORBIDDEN);
            }

            const { startDate, endDate } = req.query;

            const result = await this._doctorDashboardService.getAppointmentSummary(
                new Types.ObjectId(doctorId),
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );
            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("Summary fetched", result));
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
                            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                    )
                );
        }
    }
    async getAppointmentTrend(req: Request, res: Response): Promise<Response> {
        try {
            const doctorId = req.user?.userId;

            if (!doctorId) {
                throw new CustomError(
                    "Unauthorized doctor access",
                    StatusCode.FORBIDDEN
                );
            }

            const { startDate, endDate, interval } = req.query;

            if (!startDate || !endDate || !interval) {
                throw new CustomError(
                    "Missing required query parameters",
                    StatusCode.BAD_REQUEST
                );
            }

            const trendData =
                await this._doctorDashboardService.getAppointmentTrendData(
                    new Types.ObjectId(doctorId),
                    new Date(startDate as string),
                    new Date(endDate as string),
                    interval as "day" | "week" | "month"
                );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Appointment trend data fetched successfully",
                        trendData
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
                            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                    )
                );
        }
    }
    async getRevenueTrend(req: Request, res: Response): Promise<Response> {
        try {
            const doctorId = req.user?.userId;

            if (!doctorId) {
                throw new CustomError(
                    "Unauthorized doctor access",
                    StatusCode.FORBIDDEN
                );
            }

            const { startDate, endDate, interval } = req.query;

            if (!startDate || !endDate || !interval) {
                throw new CustomError(
                    "Missing required query parameters",
                    StatusCode.BAD_REQUEST
                );
            }

            const result = await this._doctorDashboardService.getRevenueStatistics(
                new Types.ObjectId(doctorId),
                new Date(startDate as string),
                new Date(endDate as string),
                interval as "day" | "week" | "month"
            );

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("Revenue trend data fetched", result));
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
                            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                    )
                );
        }
    }

    async generateDoctorReport(req: Request, res: Response): Promise<Response> {
        try {
            const doctorId = req.user?.userId;
            const { startDate, endDate, format } = req.query;

            console.log("===>", doctorId, startDate, endDate, format);

            if (!doctorId || !startDate || !endDate || !format) {
                throw new CustomError(
                    "Missing required parameters",
                    StatusCode.BAD_REQUEST
                );
            }

            const url = await this._doctorDashboardService.generateReport(
                new Types.ObjectId(doctorId),
                new Date(startDate as string),
                new Date(endDate as string),
                format as "pdf" | "excel"
            );

            console.log("linik==>", url);

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse("Report generated successfully", {
                        downloadUrl: url,
                    })
                );
        } catch (error) {
            console.log("report genereation error: ", error);

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
                            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                    )
                );
        }
    }

    async getTopServices(req: Request, res: Response): Promise<Response> {
        try {
            const doctorId = req.user?.userId;

            if (!doctorId) {
                throw new CustomError("Unauthorized", StatusCode.FORBIDDEN);
            }

            const { startDate, endDate, interval } = req.query;

            const topServices = await this._doctorDashboardService.getTopServices(
                new Types.ObjectId(doctorId),
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined,
                interval as "day" | "week" | "month"
            );

            return res.status(StatusCode.OK).json({
                message: "Top services fetched successfully",
                data: topServices,
            });
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
                            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                    )
                );
        }
    }
}

export default DoctorDashboardController;
