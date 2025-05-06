import { Types } from "mongoose";
import { AppointmentStatusSummary, AppointmentTrendData, RevenueTrendData, TopServiceData } from "../../../types/dashboardDto";
import IDoctorDashboardService from "../../interfaces/dashboardService/IDoctorDashboardService";
import IDoctorDashboardRepository from "../../../repositories/interfaces/dashboard/IDoctorDashboardRepository";
import { StatusCode } from "../../../constants/statusCode";
import { CustomError } from "../../../utils/CustomError";
import path from 'path'
import fs from 'fs'
import { generateDoctorReport } from "../../../utils/reportGenerator/generateDoctorReport";
import { subDays } from "date-fns";
import { end } from "pdfkit";
import { uploadBufferTOCloudinary } from "../../../utils/reportGenerator/reportUploadCloudinary";


class DoctorDashboardService implements IDoctorDashboardService {

    private _dashboardRepo: IDoctorDashboardRepository

    constructor(dashboardRepo: IDoctorDashboardRepository) {
        this._dashboardRepo = dashboardRepo
    }
   

    async getAppointmentSummary(doctorId: Types.ObjectId, startDate?: Date, endDate?: Date): Promise<AppointmentStatusSummary> {
        try {

            return await this._dashboardRepo.getAppointmentStatusSummary(doctorId, startDate, endDate);

        } catch (error) {
            throw new CustomError("Failed to get appointment summary", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }



    async getAppointmentTrendData(
        doctorId: Types.ObjectId,
        startDate: Date,
        endDate: Date,
        interval: "day" | "week" | "month"

    ) {
        try {
            if (!doctorId || !startDate || !endDate) {
                throw new CustomError("Invalid input for trend data", StatusCode.BAD_REQUEST);
            }

            return await this._dashboardRepo.getAppointmentTrend(doctorId, startDate, endDate, interval);
        } catch (err) {
            console.error("DoctorDashboardService -> getAppointmentTrendData:", err);
            if (err instanceof CustomError) {
                throw err
            } else {

                throw new CustomError(
                    "Failed to retrieve appointment trend data",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async getRevenueStatistics(doctorId: Types.ObjectId, startDate: Date, endDate: Date, interval: "day" | "week" | "month"): Promise<RevenueTrendData[]> {
        try {
            return await this._dashboardRepo.getRevenueTrend(doctorId, startDate, endDate, interval);
        } catch (error) {
            throw new CustomError("Failed to fetch revenue trend", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }


    async generateReport(doctorId: Types.ObjectId, startDate: Date, endDate: Date, format: "pdf" | "excel"): Promise<string> {
        try {
            const appointments = await this._dashboardRepo.getAppointmentsForReport(doctorId, startDate, endDate);
            const reportBuffer = await generateDoctorReport(appointments, format);
    

            const fileExtension = format === "pdf" ? "pdf" : "xlsx";
            const publicId = `doctor_report_${doctorId}_${Date.now()}.${fileExtension}`;

            const cloudinaryUrl = await uploadBufferTOCloudinary(reportBuffer,publicId,"raw")

            return cloudinaryUrl
        } catch (error) {
            console.error("File write failed: ", error); 
            throw new CustomError("Failed to generate report", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getTopServices(doctorId: Types.ObjectId, startDate?: Date, endDate?: Date, interval?: "day" | "week" | "month"): Promise<TopServiceData[]> {
        try {
           

            if(!startDate || !endDate){
                const today = new Date()


                switch (interval){
                    case "day":
                        startDate = subDays(today,1);
                        break;
                    case "week":
                        startDate = subDays(today,7)
                        break;
                    case "month":
                        startDate = subDays(today,30)
                        break;
                    default:
                        startDate = subDays(today,7)
                }
                endDate = today
            }



            return await this._dashboardRepo.getTopServices(doctorId,startDate,endDate)

        } catch (error) {
            throw new CustomError("Failed to fetch top services", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

}

export default DoctorDashboardService