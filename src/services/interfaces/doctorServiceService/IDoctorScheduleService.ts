import {
    IScheduleValidationResponse,
    TempSlot,
} from "../../../types/schedules";
import { IDoctorAvailability } from "../../../model/doctorService/doctorSchedule";
import { Pagination } from "../../../repositories/interfaces/doctorService/IDoctorScheduleRepository";
import { CreateMultiDayScheduleRequest, GeneratedScheduleBlock, RecurringSlotRequest } from "../../../types/bookingTypes";


interface IDoctorScheduleService {
    validateSchedule(
        doctorId: string,
        serviceId: string,
        date: Date,
        startTime: Date,
        endTime: Date
    ): Promise<IScheduleValidationResponse>;

    // findConflictingSchedules(
    //     doctorId: mongoose.Types.ObjectId,
    //     serviceId: mongoose.Types.ObjectId,
    //     date: Date,
    //     start_time: Date,
    //     end_time: Date
    // ): Promise<IDoctorAvailability | null>;

    validateAndGenerateSlots(
        doctorId: string,
        serviceId: string,
        date: Date,
        start_time: string,
        end_time: string,
        duration: number
    ): Promise<TempSlot[] | null>;

    createSchedule(
        scheduleData: Partial<IDoctorAvailability>
    ): Promise<IDoctorAvailability>;

    getDoctorSchedules(
        doctorId: string,
        serviceId?: string,
        startDate?: string,
        endDate?: string,
        status?: "completed" | "upcoming",
        page?: number,
        limit?: number
    ): Promise<{ schedules: IDoctorAvailability[]; pagination: Pagination }>;

    cancelDoctorSchedule(
        scheduleId: string,
        reason: string,
        doctorId: string
    ): Promise<void>;


    generateRecurringSlots(input: RecurringSlotRequest): Promise<GeneratedScheduleBlock[]>

    createMultiDaySchedule(input: CreateMultiDayScheduleRequest): Promise<IDoctorAvailability[]>
}

export default IDoctorScheduleService;
