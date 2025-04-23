import mongoose, { isValidObjectId } from "mongoose";
import { StatusCode } from "../../../constants/statusCode";
import IDoctorScheduleRepository, { Pagination } from "../../../repositories/interfaces/doctorService/IDoctorScheduleRepository";
import { IScheduleValidationResponse, TempSlot } from "../../../types/schedules";
import { CustomError } from "../../../utils/CustomError";
import IDoctorScheduleService from "../../interfaces/doctorServiceService/IDoctorScheduleService";
import { IDoctorAvailability } from "../../../model/doctorService/doctorSchedule";
import { IScheduleResponse } from "../../../types/bookingTypes";
import ConsultationAppointmentModal from "../../../model/consultationBooking/consultationBooking";
import { IDoctorService } from "../../../model/doctorService/doctorServicesModal";
import IWalletRepository from "../../../repositories/interfaces/wallet/IWalletRepository";
import { sendAppointmentCancellationEmail } from "../../../utils/emailUtils";


class DoctorScheduleService implements IDoctorScheduleService {

    private _doctorScheduleRepository: IDoctorScheduleRepository;
    private _walletRepository: IWalletRepository;

    constructor(doctorScheduleRepository: IDoctorScheduleRepository, walletRepository: IWalletRepository) {
        this._doctorScheduleRepository = doctorScheduleRepository,
            this._walletRepository = walletRepository

    }






    async validateSchedule(doctorId: string, serviceId: string, date: Date, startTime: Date, endTime: Date): Promise<IScheduleValidationResponse> {
        try {

            console.log("*******service");

            console.log("service==>", doctorId, "==", startTime, "==", endTime, "==", serviceId);
            const overlappingSchedule = await this._doctorScheduleRepository.findOverlappingSchedules(
                doctorId,
                serviceId,
                date,
                startTime,
                endTime
            );

            if (overlappingSchedule) {
                return { success: false, message: "Schedule conflicts with an existing booking." }
            }

            return { success: true, message: "Schedule is valid." }

        } catch (error) {
            console.error("Error in validateSchedule:", error);
            if (error instanceof CustomError) {
                throw new CustomError(error.message, error.statusCode);
            } else {
                throw new Error("Internal server error")
            }
        }
    }


    findConflictingSchedules(doctorId: mongoose.Types.ObjectId, serviceId: mongoose.Types.ObjectId, date: Date, start_time: Date, end_time: Date): Promise<IDoctorAvailability | null> {
        throw new Error("Method not implemented.");
    }
    // Generate dynamic slots based on start_time, end_time, and duration

    generateSlots(
        start_time: Date,
        end_time: Date,
        duration: number
    ) {
        const slots: TempSlot[] = []

        let currentTime = new Date(start_time);

        while (currentTime < end_time) {
            let nextTime = new Date(currentTime.getTime() + duration * 60000)

            if (nextTime > end_time) break;




            slots.push({
                slot_id: new mongoose.Types.ObjectId(),
                start_time: new Date(currentTime),
                end_time: new Date(nextTime),
                status: "available",
                is_break: false
            })

            currentTime = nextTime
        }

        return slots
    }




    //  Validate before generating slots

    async validateAndGenerateSlots(
        doctorId: string,
        serviceId: string,
        date: Date,
        start_time: string,
        end_time: string,
        duration: number
    ): Promise<TempSlot[] | null> {

        console.log("****", date.toString());
        // 1. Get date components in local time (IST)
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();




        // 2. Parse time components
        const [startHours, startMinutes] = start_time.split(":").map(Number);
        const [endHours, endMinutes] = end_time.split(":").map(Number);

        // 3. Create Date objects in local time (IST)
        const startDateTime = new Date(year, month, day, startHours, startMinutes, 0);
        const endDateTime = new Date(year, month, day, endHours, endMinutes, 0);



        // Validation: Ensure start_time < end_time
        if (startDateTime >= endDateTime) {
            throw new CustomError("End time must be greater than start time.", StatusCode.BAD_REQUEST);
        }

        const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
        const serviceObjectId = new mongoose.Types.ObjectId(serviceId);



        //  Check for conflicting schedules (same service, overlapping time)
        const conflictingSchedule = await this._doctorScheduleRepository.findConflictingSchedules(
            doctorObjectId,
            serviceObjectId,
            date,
            startDateTime,
            endDateTime
        )

        if (conflictingSchedule) {
            throw new CustomError("Conflicting schedule exists for this doctor and service.", StatusCode.BAD_REQUEST)
        }


        // Generate slots - using local time directly
        const generatedSlots = this.generateSlots(startDateTime, endDateTime, duration);
        console.log("Generated slots in local IST:");

        // For debugging - show slots in IST
        console.log("Generated slots in IST:");
        generatedSlots.forEach(slot => {
            console.log(
                `${new Date(slot.start_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} - ` +
                `${new Date(slot.end_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`
            );
        });

        return generatedSlots;
    }

    async createSchedule(scheduleData: IDoctorAvailability) {

        try {
            const schedule = await this._doctorScheduleRepository.createSchedule(scheduleData);
            return schedule;
        } catch (error) {
            console.error("Error in createSchedule:", error);

            if (error instanceof CustomError) {
                throw new CustomError(error.message, error.statusCode);
            } else {
                throw new Error("Internal server error");
            }
        }
    }



    async getDoctorSchedules(doctorId: string, serviceId?: string, startDate?: string, endDate?: string, status?: "completed" | "upcoming", page: number = 1, limit: number = 10): Promise<{ schedules: IDoctorAvailability[]; pagination: Pagination }> {
        try {



            // Convert dates to proper UTC for database queries
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;

            return await this._doctorScheduleRepository.fetchSchedules(
                doctorId,
                serviceId,
                start,
                end,
                status,
                page,
                limit
            )

        } catch (error) {
            throw new CustomError("Error in fetching schedules:", StatusCode.INTERNAL_SERVER_ERROR)
        }
    }


    async cancelDoctorSchedule(scheduleId: string, reason: string, doctorId: string): Promise<void> {
        try {

            const schedule = await this._doctorScheduleRepository.findById(scheduleId)


            if (!schedule) {
                throw new CustomError("Schedule not found", StatusCode.NOT_FOUND)
            }

            if (schedule.doctorId.toString() !== doctorId) {
                throw new CustomError("Unauthorized. This schedule does not belong to you.", StatusCode.UNAUTHORIZED)
            }

            if (new Date(schedule.date) < new Date()) {
                throw new CustomError("Cannot cancel a past schedule", StatusCode.BAD_REQUEST);
            }


            const appointments: any = await ConsultationAppointmentModal.find(
                {
                    doctorScheduleId: scheduleId,
                    status: "booked"
                }
            ).populate("patientId", "email fullName")
                .populate("serviceId", "fee")


            for (const appointment of appointments) {

                appointment.status = "cancelled";
                await appointment.save()

                if (appointment.paymentStatus === "paid") {
                    const refundAmount = appointment.serviceId?.fee ?? 100;

                    await this._walletRepository.addTransaction({
                        userId: appointment.patientId,
                        amount: refundAmount,
                        type: "credit",
                        reason: "Doctor cancelled schedule - refund",
                        relatedAppointmentId: appointment._id,
                        status: "success"
                    })

                }

                const email = appointment.patientId.email;
                const appointmentDate = appointment.appointmentDate.toLocaleString();
                await sendAppointmentCancellationEmail(email, appointmentDate, reason)

            }

            const cancelled = await this._doctorScheduleRepository.cancelSchedule(scheduleId, reason)

            if (!cancelled) {
                throw new CustomError("Schedule was already cancelled or could not be updated", StatusCode.BAD_REQUEST)
            }





        } catch (error) {

            console.error("===> service error",error);
            

            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError("Error in cancelling doctor schedule:", StatusCode.INTERNAL_SERVER_ERROR)
            }

        }
    }















}


export default DoctorScheduleService