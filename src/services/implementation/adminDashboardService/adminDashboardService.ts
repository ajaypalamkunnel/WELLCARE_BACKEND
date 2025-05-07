import { end } from "pdfkit";
import { StatusCode } from "../../../constants/statusCode";
import DoctorSubscriptionRepository from "../../../repositories/implementation/doctorSubscriptions/DoctorSubscriptions";
import IAdminDashboardRepository from "../../../repositories/interfaces/adminDashboard/IAdminDashboard";
import { PlanDistributionDTO, RevenueTrendDTO, SubscriptionOverviewDTO, SubscriptionReportDownloadDTO } from "../../../types/admin/adminDashboardDto";
import { DoctorAnalyticsSummaryDTO, RevenueDoctorTrendDTO, ServiceRevenueDTO, TopDoctorDTO } from "../../../types/admin/doctorAnalytics";
import { uploadBufferToCloudinary } from "../../../utils/adminDashboard/adminDashboardCloudinary";
import { generateSubscriptionReport } from "../../../utils/adminDashboard/subscriptionReportGenerator";
import { CustomError } from "../../../utils/CustomError";
import IAdminDashboardService from "../../interfaces/adminDashboardService/IAdminDashboardService";

class AdminDashboardService implements IAdminDashboardService {

    private _adminDashboardRepo: IAdminDashboardRepository

    constructor(adminDashboardRepo: IAdminDashboardRepository) {
        this._adminDashboardRepo = adminDashboardRepo
    }







    async getOverview(): Promise<SubscriptionOverviewDTO> {
        try {

            const [totalRevenue, activeSubscriptions, topPlans] = await Promise.all([
                this._adminDashboardRepo.getTotalRevenue(),
                this._adminDashboardRepo.getActiveSubscriptionCount(),
                this._adminDashboardRepo.getMostSubscribedPlans()

            ])

            console.log("==>", totalRevenue, "===",
                activeSubscriptions, "====",
                topPlans);


            return {
                totalRevenue,
                activeSubscriptions,
                topPlans
            }

        } catch (error) {
            console.error("Error in SubscriptionAnalyticsService.getOverview:", error);
            throw new CustomError("Failed to fetch subscription analytics overview", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }



    async getRevenueTrend(startDate: Date, endDate: Date, interval: "day" | "week" | "month"): Promise<RevenueTrendDTO[]> {
        try {

            return await this._adminDashboardRepo.getRevenueTrend(startDate, endDate, interval)


        } catch (error) {
            console.error("Error in getRevenueTrend:", error);
            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError("Failed to fetch revenue trend", StatusCode.INTERNAL_SERVER_ERROR)
            }
        }
    }


    async getPlanDistribution(startDate?: Date, endDate?: Date): Promise<PlanDistributionDTO[]> {
        try {
            return await this._adminDashboardRepo.getPlanDistribution(startDate, endDate);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            } else {

                throw new CustomError("Service error: Failed to fetch plan distribution", StatusCode.INTERNAL_SERVER_ERROR);
            }
        }
    }


    async generateSubscriptionReport(startDate: Date, endDate: Date, format: "pdf" | "excel"): Promise<SubscriptionReportDownloadDTO> {
        try {

            const data = await this._adminDashboardRepo.getSubscriptionsForReport(startDate, endDate)
            const buffer = await generateSubscriptionReport(data, format)

            const filename = `subscription_report_${Date.now()}.${format === "pdf" ? "pdf" : "xlsx"}`;
            const url = await uploadBufferToCloudinary(buffer, filename);

            return { downloadUrl: url }

        } catch (error) {
            throw new CustomError("Failed to generate and upload report", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }



    async getDoctorAnalyticsSummary(): Promise<DoctorAnalyticsSummaryDTO[]> {
        try {

            const data = await this._adminDashboardRepo.getDoctorAnalyticsSummary();

            const preparedData = data.map(item => ({
                doctorId: item.doctorId.toString(),
                fullName: item.fullName,
                totalRevenue: item.totalRevenue,
                completedAppointments: item.completedAppointments,
                averageFee: item.averageFee,
                retentionRate: Number(item.retentionRate.toFixed(2))
            }))

            return preparedData

        } catch (error) {

            console.error("DoctorAnalyticsService Error:", error);


            throw new CustomError("Failed to fetch doctor analytics summary", StatusCode.INTERNAL_SERVER_ERROR);


        }
    }


    async getDoctorRevenueTrend(startDate: Date, endDate: Date, interval: "day" | "month"): Promise<RevenueDoctorTrendDTO[]> {
        try {

            const result = await this._adminDashboardRepo.getDoctorRevenueTrend(startDate, endDate, interval)

            const preparedData = result.map((entry): RevenueDoctorTrendDTO => ({
                label: entry.label,
                doctorId: entry.doctorId.toString(),
                fullName: entry.fullName,
                revenue: entry.revenue
            }));

            return preparedData

        } catch (error) {
            console.error("DoctorAnalyticsService (Revenue Trend) Error:", error);
            throw new CustomError("Failed to fetch revenue trend", StatusCode.INTERNAL_SERVER_ERROR);

        }
    }

    async getServiceRevenue(): Promise<ServiceRevenueDTO[]> {
        try {

            const result = await this._adminDashboardRepo.getServiceRevenue()

            const preparedData = result.map((item) => ({
                serviceName: item.serviceName,
                revenue: item.revenue
            }));

            return preparedData

        } catch (error) {
            console.error("DoctorAnalyticsService.getServiceRevenue error:", error);
            throw new CustomError("Failed to fetch service revenue", StatusCode.INTERNAL_SERVER_ERROR);

        }
    }


    async getTopPerformingDoctors(): Promise<TopDoctorDTO[]> {
        try {

            const result = await this._adminDashboardRepo.getTopPerformingDoctors()

            const preparedData = result.map((doc) => ({
                doctorId: doc.doctorId,
                fullName: doc.fullName,
                totalRevenue: doc.totalRevenue,
                appointmentCount: doc.appointmentCount
            }));

            return preparedData

        } catch (error) {
            console.error("getTopPerformingDoctors error:", error);
            throw new CustomError("Failed to fetch top-performing doctors", StatusCode.INTERNAL_SERVER_ERROR);

        }
    }


}

export default AdminDashboardService