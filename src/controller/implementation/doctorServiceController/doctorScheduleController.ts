import mongoose from "mongoose";
import { StatusCode } from "../../../constants/statusCode";
import IDoctorScheduleService from "../../../services/interfaces/doctorServiceService/IDoctorScheduleService";
import { CustomError } from "../../../utils/CustomError";
import {
    generateErrorResponse,
    generateSuccessResponse,
} from "../../../utils/response";
import { IDoctorScheduleController } from "../../interfaces/doctorServiceController/IDoctorScheduleController";
import { Request, Response } from "express";
import { ISlot } from "../../../model/doctorService/doctorSchedule";

class DoctorScheduleController implements IDoctorScheduleController {
    private _doctorScheduleService: IDoctorScheduleService;

    constructor(doctorScheduleService: IDoctorScheduleService) {
        this._doctorScheduleService = doctorScheduleService;
    }

    async validateSchedule(req: Request, res: Response): Promise<Response> {
        try {
            console.log("hi validateSchedule controller", req.body);

            const { doctorId, service, date, start_time, end_time } = req.body;
            console.log("---->controller", start_time, "---", end_time);

            if (!doctorId || !service || !date || !start_time || !end_time) {
                console.log("wrong-----");

                return res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ success: false, message: "Missing required fields." });
            }

            // Convert start_time and end_time to full DateTime
            const startDateTime = new Date(`${date}T${start_time}:00Z`); // ISO format
            const endDateTime = new Date(`${date}T${end_time}:00Z`);

            console.log("Converted start time:", startDateTime);
            console.log("Converted end time:", endDateTime);

            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                return res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ success: false, message: "Invalid date or time format." });
            }

            if (endDateTime <= startDateTime) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "End time must be greater than start time.",
                });
            }

            const validationResult =
                await this._doctorScheduleService.validateSchedule(
                    doctorId,
                    service,
                    new Date(date),
                    startDateTime,
                    endDateTime
                );

            if (!validationResult.success) {
                return res.status(StatusCode.CONFLICT).json(validationResult);
            }

            return res.status(StatusCode.OK).json(validationResult);
        } catch (error) {
            console.error("Error in validateSchedule controller:", error);

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

    async generateSlot(req: Request, res: Response): Promise<Response> {
        try {
            const { doctorId, service, date, start_time, end_time, duration } =
                req.body;

            if (
                !doctorId ||
                !service ||
                !date ||
                !start_time ||
                !end_time ||
                !duration
            ) {
                throw new CustomError(
                    "Missing required fields",
                    StatusCode.BAD_REQUEST
                );
            }

            const generatedSlots =
                await this._doctorScheduleService.validateAndGenerateSlots(
                    doctorId,
                    service,
                    new Date(date),
                    start_time,
                    end_time,
                    duration
                );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "slots generated successfully",
                        generatedSlots
                    )
                );
        } catch (error) {
            console.log("Error while generating slot", error);

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

    async createSchedule(req: Request, res: Response): Promise<Response> {
        try {
            const {
                doctorId,
                serviceId,
                date,
                start_time,
                end_time,
                duration,
                slots,
            } = req.body;

            console.log("create schedule controller ===> ", req.body);

            if (
                !doctorId ||
                !serviceId ||
                !date ||
                !start_time ||
                !end_time ||
                !duration ||
                !slots
            ) {
                throw new CustomError("Missing required fields", 400);
            }

            const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
            const serviceObjectId = new mongoose.Types.ObjectId(serviceId);

            // Convert date to Indian Time Zone properly
            const scheduleDate = new Date(date);
            scheduleDate.setUTCHours(0, 0, 0, 0); // Set to midnight UTC

            // Convert times with IST Offset
            const startDateTime = new Date(`${date}T${start_time}:00`);
            startDateTime.setHours(
                startDateTime.getHours() + 5,
                startDateTime.getMinutes() + 30
            ); // Convert to IST

            const endDateTime = new Date(`${date}T${end_time}:00`);
            endDateTime.setHours(
                endDateTime.getHours() + 5,
                endDateTime.getMinutes() + 30
            ); // Convert to IST

            console.log("Final Start Time in IST:", startDateTime);
            console.log("Final End Time in IST:", endDateTime);

            if (startDateTime >= endDateTime) {
                throw new CustomError("End time must be greater than start time.", 400);
            }

            // 🔹 Format slot times in IST
            const formattedSlots: ISlot[] = slots.map((slot: ISlot) => ({
                slot_id: new mongoose.Types.ObjectId(slot.slot_id),
                start_time: new Date(
                    new Date(slot.start_time).getTime() + 5.5 * 60 * 60 * 1000
                ), // Convert to IST
                end_time: new Date(
                    new Date(slot.end_time).getTime() + 5.5 * 60 * 60 * 1000
                ), // Convert to IST
                status: slot.status || "available",
                is_break: slot.is_break || false,
            }));

            // Pass properly formatted data
            const newSchedule = await this._doctorScheduleService.createSchedule({
                doctorId: doctorObjectId,
                serviceId: serviceObjectId,
                date: scheduleDate,
                start_time: startDateTime,
                end_time: endDateTime,
                duration,
                availability: formattedSlots,
            });

            console.log("Njan aatto angottu varunne, ==>", newSchedule);

            return res.status(201).json({ success: true, schedule: newSchedule });
        } catch (error) {
            console.error("Error while schedule creation");

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

    async listSchedules(req: Request, res: Response): Promise<Response> {
        try {
            const { doctorId, serviceId, startDate, endDate, status, page, limit } =
                req.query;

            if (!doctorId) {
                return res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ success: false, message: "Doctor ID is required." });
            }

            const schedules = await this._doctorScheduleService.getDoctorSchedules(
                doctorId as string,
                serviceId as string,
                startDate as string,
                endDate as string,
                status as "completed" | "upcoming",
                Number(page) || 1,
                Number(limit) || 10
            );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse("Schedule fetched successfully", schedules)
                );
        } catch (error) {
            console.error("Error in schedule featching", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    error instanceof CustomError ? error.message : "Internal server error"
                );
        }
    }

    async cancelSchedule(req: Request, res: Response): Promise<Response> {
        try {
            const scheduleId = req.params.scheduleId;
            const reason = req.body.reason;
            const doctorId = req.user?.userId;

            console.log(reason, "==>", scheduleId, "==>", doctorId);

            if (!doctorId) {
                throw new CustomError("Unauthorized access", StatusCode.UNAUTHORIZED);
            }

            if (!scheduleId || !reason) {
                throw new CustomError(
                    "Schedule ID and reason are required",
                    StatusCode.BAD_REQUEST
                );
            }

            await this._doctorScheduleService.cancelDoctorSchedule(
                scheduleId,
                reason,
                doctorId
            );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Schedule cancelled successfully and patients notified"
                    )
                );
        } catch (error) {
            console.error("schedule cancelling error", error);

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

export default DoctorScheduleController;
