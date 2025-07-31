/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import DoctorSchedules, {
    IDoctorAvailability,
} from "../../../model/doctorService/doctorSchedule";
import { BaseRepository } from "../../base/BaseRepository";
import IDoctorScheduleRepository, {
    Pagination,
} from "../../interfaces/doctorService/IDoctorScheduleRepository";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";

class DoctorScheduleRepository
    extends BaseRepository<IDoctorAvailability>
    implements IDoctorScheduleRepository {
    constructor() {
        super(DoctorSchedules);
    }

    async findOverlappingSchedules(
        doctorId: string,
        serviceId: string,
        date: Date,
        startTime: Date,
        endTime: Date
    ): Promise<IDoctorAvailability | null> {
        try {

            return await DoctorSchedules.findOne({
                doctorId: new mongoose.Types.ObjectId(doctorId),
                serviceId: new mongoose.Types.ObjectId(serviceId),
                date: date,
                $or: [{ start_time: { $lt: endTime }, end_time: { $gt: startTime } }],
            });
        } catch (error) {
            console.error("Error in findOverlappingSchedules:", error);
            throw new CustomError(
                "Database error while checking overlapping schedules.",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async markSlotAsPending(
        scheduleId: string,
        slotId: string
    ): Promise<boolean> {
        try {
            const result = await DoctorSchedules.findByIdAndUpdate(
                {
                    _id: scheduleId,
                    "availability.slot_id": slotId,
                    "availability.status": "available",
                },
                {
                    $set: {
                        "availability.$[elem].status": "pending",
                        "availability.$[elem].pendingAt": new Date(),
                    },
                },
                {
                    arrayFilters: [{ "elem.slot_id": slotId }],
                    new: true,
                }
            );

            return !!result;
        } catch (error) {
            console.error("Failed to mark slot as pending:", error);
            throw new Error("Slot update failed. Please try again.");
        }
    }

    async findConflictingSchedules(
        doctorId: mongoose.Types.ObjectId,
        serviceId: mongoose.Types.ObjectId,
        date: Date,
        start_time: Date,
        end_time: Date
    ): Promise<IDoctorAvailability | null> {
        try {
            return await DoctorSchedules.findOne({
                doctorId,
                date,

                $or: [{ start_time: { $lt: end_time }, end_time: { $gt: start_time } }],
                serviceId,
            });
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError(
                    "Error while find Conflicting Schedules in database",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }

        }
    }
    async createSchedule(
        scheduleData: Partial<IDoctorAvailability>
    ): Promise<IDoctorAvailability> {
        try {
            const schedule = new DoctorSchedules(scheduleData);
            return await schedule.save();
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError(
                    "Failed to save schedule",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async fetchSchedules(
        doctorId: string,
        serviceId?: string,
        startDate?: Date,
        endDate?: Date,
        status?: "completed" | "upcoming",
        page: number = 1,
        limit: number = 10
    ): Promise<{ schedules: IDoctorAvailability[]; pagination: Pagination }> {
        try {
            const filter: any = { doctorId: new mongoose.Types.ObjectId(doctorId) };

            if (serviceId) {
                filter.serviceId = new mongoose.Types.ObjectId(serviceId);
            }

            if (startDate || endDate) {
                filter.date = {};
                if (startDate) filter.date.$gte = startDate;
                if (endDate) filter.date.$lte = endDate;
            }

            // Get total count for pagination
            const totalRecords = await DoctorSchedules.countDocuments(filter);

            const schedules = await DoctorSchedules.find(filter)
                .populate("serviceId", "name fee mode")
                .sort({ start_time: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();

            return {
                schedules,
                pagination: {
                    totalRecords,
                    totalPages: Math.ceil(totalRecords / limit),
                    currentPage: page,
                },
            };
        } catch (error) {
            console.log("Error in DoctorSchedule Repository", error);

            throw new CustomError(
                "Failed to fetch schedules: ",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getScheduleBySlot(
        scheduleId: string,
        slotId: string
    ): Promise<IDoctorAvailability | null> {
        try {
            const schedule = await DoctorSchedules.findOne({
                _id: scheduleId,
                availability: {
                    $elemMatch: {
                        slot_id: new mongoose.Types.ObjectId(slotId),
                        status: "available",
                    },
                },
            }).populate("serviceId", "name fee mode");

            return schedule;
        } catch (error) {
            console.log("Error while getting schedule by slot:", error);
            throw new CustomError(
                "Failed to fetch schedule",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getScheduleById(scheduleId: string): Promise<IDoctorAvailability> {
        try {
            const schedule = await DoctorSchedules.findById(scheduleId).populate(
                "serviceId",
                "name fee mode"
            );

            return schedule!;
        } catch (error) {
            console.log("Error while get Schedule By I in repository : ", error);

            throw new CustomError(
                "Failed to fetch schedule",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findAvailableSlot(scheduleId: string, slotId: string) {

        return await DoctorSchedules.findOne({
            _id: scheduleId,
            "availability.slot_id": slotId,
            "availability.status": "available",
        }).populate("serviceId", "name fee mode");
    }

    findPendingSlot(
        scheduleId: string,
        slotId: string
    ): Promise<IDoctorAvailability | null> {
        return DoctorSchedules.findOne({
            _id: scheduleId,
            "availability.slot_id": slotId,
            "availability.status": "pending",
        }).populate("serviceId", "name fee mode");
    }

    async cancelSchedule(scheduleId: string, reason: string): Promise<boolean> {

        try {
            const result = await DoctorSchedules.updateOne(
                {
                    _id: new mongoose.Types.ObjectId(scheduleId),
                    isCancelled: false,
                },
                {
                    $set: {
                        isCancelled: true,
                        cancellationReason: reason,
                        cancelledAt: new Date(),
                        "availability.$[].status": "cancelled",
                    },
                }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError(
                    "Error while cancelling schema",
                    StatusCode.INTERNAL_SERVER_ERROR
                );

            }
        }
    }

    async releaseExpiredPendingSlots(
        expirationMinutes: number = 10
    ): Promise<mongoose.UpdateResult> {
        try {
            const cutoff = new Date(Date.now() - expirationMinutes * 60 * 1000);

            const result = await DoctorSchedules.updateMany(
                {
                    availability: {
                        $elemMatch: {
                            status: "pending",
                            pendingAt: { $lt: cutoff },
                        },
                    },
                },
                {
                    $set: {
                        "availability.$[elem].status": "available",
                    },
                    $unset: {
                        "availability.$[elem].pendingAt": "",
                    },
                },
                {
                    arrayFilters: [
                        {
                            "elem.status": "pending",
                            "elem.pendingAt": { $lt: cutoff },
                        },
                    ],
                }
            );

            return result;
        } catch (error) {
            console.error("Failed to release expired pending slots:", error);
            throw new Error("Slot release failed");
        }
    }
}

export default DoctorScheduleRepository;
