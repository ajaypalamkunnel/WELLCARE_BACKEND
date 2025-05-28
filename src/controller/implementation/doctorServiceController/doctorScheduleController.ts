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


            const { doctorId, service, date, start_time, end_time } = req.body;


            if (!doctorId || !service || !date || !start_time || !end_time) {


                return res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ success: false, message: "Missing required fields." });
            }

            // Convert start_time and end_time to full DateTime
            const startDateTime = new Date(`${date}T${start_time}:00Z`); // ISO format
            const endDateTime = new Date(`${date}T${end_time}:00Z`);


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
            const { doctorId, service, startDate, endDate, status, page, limit } =
                req.query;

            if (!doctorId) {
                return res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ success: false, message: "Doctor ID is required." });
            }

            const schedules = await this._doctorScheduleService.getDoctorSchedules(
                doctorId as string,
                service as string,
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


    async generateRecurringSlots(req: Request, res: Response): Promise<Response> {

        console.log("---generateRecurringSlots");


        try {
            const { doctorId, service, startDate, endDate, duration, timeBlocks } = req.body;

            console.log("==>time blocke : ",timeBlocks);
            

            // Validate input
            if (!doctorId || !service || !startDate || !duration || !Array.isArray(timeBlocks)) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields or invalid format.",
                });
            }

            if (timeBlocks.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one time block is required.",
                });
            }

            // Convert string dates to Date objects
            const start = new Date(startDate);
            const end = endDate ? new Date(endDate) : new Date();
            if (!endDate) end.setDate(start.getDate() + 30); // default 30 days

            console.log("formatted : ",start, " --- ",end);
            

            const slots = await this._doctorScheduleService.generateRecurringSlots({
                doctorId,
                serviceId: service,
                startDate: start,
                endDate: end,
                duration,
                timeBlocks,
            });

            return res.status(200).json({
                success: true,
                message: "Recurring slots generated successfully.",
                data: slots,
            });
        } catch (error) {
            console.error("Error generating recurring slots:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error while generating recurring slots.",
            });
        }
    }

    async createMultiDaySchedule(req: Request, res: Response): Promise<Response> {
        console.log("--- createMultiDaySchedule");

        try {

            const { doctorId, service, startDate, endDate, duration, timeBlocks } = req.body;

            if (!doctorId || !service || !startDate || !duration || !Array.isArray(timeBlocks)) {
                throw new CustomError("Missing required fields", StatusCode.BAD_REQUEST);
            }


            const schedules = await this._doctorScheduleService.createMultiDaySchedule({
                doctorId,
                serviceId: service,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : undefined,
                duration,
                timeBlocks,
            });



            return res.status(StatusCode.OK).json({
                success: true,
                message: "Recurring schedules created successfully",
                schedules,
            })

        } catch (error) {
            console.error("Error creating recurring schedules:", error);

            return res.status(
                error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR
            ).json({
                success: false,
                message: error instanceof CustomError ? error.message : "Internal server error",
            });
        }
    }
}

export default DoctorScheduleController;
