import mongoose, { UpdateResult } from "mongoose";
import { IDoctorAvailability } from "../../../model/doctorService/doctorSchedule";
import { IBaseRepository } from "../../base/IBaseRepository";
import { IScheduleResponse } from "../../../types/bookingTypes";
import { IDoctorService } from "../../../model/doctorService/doctorServicesModal";

export interface Pagination {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
}

export default interface IDoctorScheduleRepository
    extends IBaseRepository<IDoctorAvailability> {
    findOverlappingSchedules(
        doctorId: string,
        serviceId: string,
        date: Date,
        startTime: Date,
        endTime: Date
    ): Promise<IDoctorAvailability | null>;
    findConflictingSchedules(
        doctorId: mongoose.Types.ObjectId,
        serviceId: mongoose.Types.ObjectId,
        date: Date,
        start_time: Date,
        end_time: Date
    ): Promise<IDoctorAvailability | null>;

    createSchedule(
        scheduleData: Partial<IDoctorAvailability>
    ): Promise<IDoctorAvailability>;

    fetchSchedules(
        doctorId: string,
        serviceId?: string,
        startDate?: Date,
        endDate?: Date,
        status?: "completed" | "upcoming",
        page?: number,
        limit?: number
    ): Promise<{ schedules: IDoctorAvailability[]; pagination: Pagination }>;

    markSlotAsPending(scheduleId: string, slotId: string): Promise<boolean>;

    getScheduleBySlot(
        scheduleId: string,
        slotId: string
    ): Promise<IDoctorAvailability | null>;

    getScheduleById(scheduleId: string): Promise<IDoctorAvailability | null>;

    findAvailableSlot(
        scheduleId: string,
        slotId: string
    ): Promise<IDoctorAvailability | null>;

    findPendingSlot(
        scheduleId: string,
        slotId: string
    ): Promise<IDoctorAvailability | null>;

    cancelSchedule(scheduleId: string, reason: string): Promise<boolean>;

    releaseExpiredPendingSlots(expirationMinutes: number): Promise<UpdateResult>;
}
