import mongoose from "mongoose";
import { IDoctorAvailability } from "../../../model/doctorService/doctorSchedule";
import { IBaseRepository } from "../../base/IBaseRepository";


export interface Pagination {
    totalRecords: number,
    totalPages: number,
    currentPage: number,


}

export default interface IDoctorScheduleRepository extends IBaseRepository<IDoctorAvailability> {
    findOverlappingSchedules(doctorId: string, serviceId: string, date: Date, startTime: Date, endTime: Date): Promise<IDoctorAvailability | null>
    findConflictingSchedules(
        doctorId: mongoose.Types.ObjectId,
        serviceId: mongoose.Types.ObjectId,
        date: Date,
        start_time: Date,
        end_time: Date
    ): Promise<IDoctorAvailability | null>

    createSchedule(scheduleData: Partial<IDoctorAvailability>): Promise<IDoctorAvailability>;

    fetchSchedules(
        doctorId: string,
        serviceId?: string,
        startDate?: Date,
        endDate?: Date,
        status?: "completed" | "upcoming",
        page?: number,
        limit?: number
    ): Promise<{schedules:IDoctorAvailability[];pagination:Pagination}>


}