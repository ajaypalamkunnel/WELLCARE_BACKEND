import mongoose, { mongo } from "mongoose";
import DoctorSchedules, { IDoctorAvailability } from "../../../model/doctorService/doctorSchedule";
import { BaseRepository } from "../../base/BaseRepository";
import IDoctorScheduleRepository, { Pagination } from "../../interfaces/doctorService/IDoctorScheduleRepository";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import { IScheduleResponse } from "../../../types/bookingTypes";


class DoctorScheduleRepository extends BaseRepository<IDoctorAvailability> implements IDoctorScheduleRepository {

    constructor() {
        super(DoctorSchedules)
    }
    



    async findOverlappingSchedules(doctorId: string, serviceId: string, date: Date, startTime: Date, endTime: Date): Promise<IDoctorAvailability | null> {
        try {

            console.log("==>repo", doctorId, "==", startTime, "==", endTime, "==", serviceId);


            return await DoctorSchedules.findOne({
                doctorId: new mongoose.Types.ObjectId(doctorId),
                serviceId: new mongoose.Types.ObjectId(serviceId),
                date: date,
                $or: [
                    { start_time: { $lt: endTime }, end_time: { $gt: startTime } }
                ]
            })

        } catch (error) {
            console.error("Error in findOverlappingSchedules:", error);
            throw new CustomError("Database error while checking overlapping schedules.", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async findConflictingSchedules(doctorId: mongoose.Types.ObjectId, serviceId: mongoose.Types.ObjectId, date: Date, start_time: Date, end_time: Date): Promise<IDoctorAvailability | null> {
        try {


            return await DoctorSchedules.findOne({
                doctorId,
                date,

                $or: [
                    { start_time: { $lt: end_time }, end_time: { $gt: start_time } }
                ],
                serviceId
            })

        } catch (error) {

            throw new CustomError("Error while find Conflicting Schedules in database", StatusCode.INTERNAL_SERVER_ERROR)
        }
    }
    async createSchedule(scheduleData: Partial<IDoctorAvailability>): Promise<IDoctorAvailability> {
        try {

            const schedule = new DoctorSchedules(scheduleData)
            return await schedule.save()

        } catch (error) {
            throw new CustomError("Failed to save schedule", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }




    async fetchSchedules(doctorId: string, serviceId?: string, startDate?: Date, endDate?: Date, status?: "completed" | "upcoming", page: number = 1, limit: number = 10): Promise<{ schedules: IDoctorAvailability[]; pagination: Pagination }> {


        try {

            const filter: any = { doctorId: new mongoose.Types.ObjectId(doctorId) }

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
                .sort({ start_time: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
            console.log("kittith,===", schedules);


            return {
                schedules,
                pagination: {
                    totalRecords,
                    totalPages: Math.ceil(totalRecords / limit),
                    currentPage: page,
                },
            }
        } catch (error) {

            console.log("Error in DoctorSchedule Repository", error)

            throw new CustomError("Failed to fetch schedules: ", StatusCode.INTERNAL_SERVER_ERROR)

        }

    }


    async getScheduleBySlot(scheduleId: string, slotId: string): Promise<IDoctorAvailability | null> {
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
            throw new CustomError("Failed to fetch schedule", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }
    

    async getScheduleById(scheduleId: string):Promise<IDoctorAvailability>{
        try {

            const schedule =  await DoctorSchedules.findById(scheduleId).populate("serviceId", "name fee mode")

            return schedule!

            
        } catch (error) {

            console.log("Error while get Schedule By I in repository : ",error)

            throw new CustomError("Failed to fetch schedule",StatusCode.INTERNAL_SERVER_ERROR)

            
        }

    
    }

    async findAvailableSlot(scheduleId: string, slotId: string) {
        console.log("akath findAvailableSlot==",slotId);
        
        return await DoctorSchedules.findOne({
          _id: scheduleId,
          "availability.slot_id": slotId,
          "availability.status": "available"
        }).populate("serviceId", "name fee mode")
      }


    




    
}


export default DoctorScheduleRepository