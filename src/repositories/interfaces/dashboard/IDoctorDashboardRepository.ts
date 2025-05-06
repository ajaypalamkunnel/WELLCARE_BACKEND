import { Types } from "mongoose";
import { AppointmentStatusSummary, AppointmentTrendData, RevenueTrendData, TopServiceData } from "../../../types/dashboardDto";
import { IConsultationAppointment } from "../../../model/consultationBooking/consultationBooking";


interface IDoctorDashboardRepository {


    getAppointmentStatusSummary(doctorId: Types.ObjectId, startDate?: Date, endDate?: Date): Promise<AppointmentStatusSummary>;


    getAppointmentTrend(
        doctorId: Types.ObjectId,
        startDate: Date,
        endDate: Date,
        interval: "day" | "week" | "month"
    ): Promise<AppointmentTrendData[]>;




    getRevenueTrend(
        doctorId: Types.ObjectId,
        startDate: Date,
        endDate: Date,
        interval: "day" | "week" | "month"
    ): Promise<RevenueTrendData[]>;



    getTopServices(doctorId: Types.ObjectId, startDate?: Date, endDate?: Date,interval?: "day" | "week" | "month"): Promise<TopServiceData[]>;

    getAppointmentsForReport(
        doctorId: Types.ObjectId,
        startDate: Date,
        endDate: Date
      ): Promise<IConsultationAppointment[]>;
      



}

export default IDoctorDashboardRepository