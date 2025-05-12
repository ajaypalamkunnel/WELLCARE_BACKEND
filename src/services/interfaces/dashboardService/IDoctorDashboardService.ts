import { Types } from "mongoose";
import {
  AppointmentStatusSummary,
  AppointmentTrendData,
  RevenueTrendData,
  TopServiceData,
} from "../../../types/dashboardDto";

interface IDoctorDashboardService {
  getAppointmentSummary(
    doctorId: Types.ObjectId,
    startDate?: Date,
    endDate?: Date
  ): Promise<AppointmentStatusSummary>;

  getAppointmentTrendData(
    doctorId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
    interval: "day" | "week" | "month"
  ): Promise<AppointmentTrendData[]>;

  getRevenueStatistics(
    doctorId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
    interval: "day" | "week" | "month"
  ): Promise<RevenueTrendData[]>;

  getTopServices(
    doctorId: Types.ObjectId,
    startDate?: Date,
    endDate?: Date,
    interval?: "day" | "week" | "month"
  ): Promise<TopServiceData[]>;

  generateReport(
    doctorId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
    format: "pdf" | "excel"
  ): Promise<string>;
}

export default IDoctorDashboardService;
