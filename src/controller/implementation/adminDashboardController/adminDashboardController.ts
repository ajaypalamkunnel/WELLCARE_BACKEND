import { Request, Response } from "express";
import IAdminDashboardController from "../../interfaces/adminDashboardController/IAdminDashboardController";
import IAdminDashboardService from "../../../services/interfaces/adminDashboardService/IAdminDashboardService";
import { ERROR_MESSAGES, StatusCode } from "../../../constants/statusCode";
import {
    generateErrorResponse,
    generateSuccessResponse,
} from "../../../utils/response";
import { CustomError } from "../../../utils/CustomError";

class AdminDashboardController implements IAdminDashboardController {
    private _adminDashboardService: IAdminDashboardService;
    constructor(adminDashboardService: IAdminDashboardService) {
        this._adminDashboardService = adminDashboardService;
    }

    async getOverView(req: Request, res: Response): Promise<Response> {
        try {
            const overview = await this._adminDashboardService.getOverview();

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "dashboard data fetthced suvvessfully",
                        overview
                    )
                );
        } catch (error) {
            console.log("dashboard data fetthcing error: ", error);

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
            const { startDate, endDate, interval } = req.query;

            if (!startDate || !endDate || !interval) {
                throw new CustomError(
                    "Missing required query parameters",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }

            const result = await this._adminDashboardService.getRevenueTrend(
                new Date(startDate as string),
                new Date(endDate as string),
                interval as "day" | "week" | "month"
            );

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("data fetched succefully", result));
        } catch (error) {
            console.log("dashboard data fetthcing error: ", error);

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

    async getPlanDistribution(req: Request, res: Response): Promise<Response> {
        try {
            const { startDate, endDate } = req.query;

            const result = await this._adminDashboardService.getPlanDistribution(
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Plan distribution fetched successfully",
                        result
                    )
                );
        } catch (error) {
            console.error("Plan distribution fetch error:", error);
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

    async downloadSubscriptionReport(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const { startDate, endDate, format } = req.query;

            if (!startDate || !endDate || !format) {
                throw new CustomError(
                    "Missing required parameters",
                    StatusCode.BAD_REQUEST
                );
            }

            const result =
                await this._adminDashboardService.generateSubscriptionReport(
                    new Date(startDate as string),
                    new Date(endDate as string),
                    format as "pdf" | "excel"
                );

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("Report generated successfully", result));
        } catch (error) {
            console.error("report generation error", error);

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

    async getDoctorAnalyticsSummary(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const result =
                await this._adminDashboardService.getDoctorAnalyticsSummary();

            if (!result) {
                throw new CustomError("data not found", StatusCode.BAD_REQUEST);
            }

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse("Doctor analytics summary fetched", result)
                );
        } catch (error) {
            console.error("DoctorAnalyticsController Error:", error);
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

    async getDoctorRevenueTrend(req: Request, res: Response): Promise<Response> {
        try {
            const { startDate, endDate, interval = "day" } = req.query;

            if (
                !startDate ||
                !endDate ||
                !["day", "month"].includes(interval as string)
            ) {
                throw new CustomError(
                    "Invalid or missing query parameters",
                    StatusCode.BAD_REQUEST
                );
            }

            const result = await this._adminDashboardService.getDoctorRevenueTrend(
                new Date(startDate as string),
                new Date(endDate as string),
                interval as "day" | "month"
            );

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("Revenue trend fetched", result));
        } catch (error) {
            console.error("DoctorAnalyticsController (Revenue Trend) Error:", error);
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

    async getServiceRevenue(req: Request, res: Response): Promise<Response> {
        try {
            const result = await this._adminDashboardService.getServiceRevenue();

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("Service revenue fetched", result));
        } catch (error) {
            console.error("getServiceRevenue error:", error);
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

    async getTopPerformingDoctors(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const result =
                await this._adminDashboardService.getTopPerformingDoctors();

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("Top doctors fetched", result));
        } catch (error) {
            console.error("getTopPerformingDoctors error:", error);
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

export default AdminDashboardController;
