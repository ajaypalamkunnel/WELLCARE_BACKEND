import {
    IDoctorSubscriptionPopulated,
    PlanDistributionDTO,
    RevenueTrendDTO,
} from "../../../types/admin/adminDashboardDto";
import { DoctorAnalyticsSummaryDTO, RevenueDoctorTrendDTO, ServiceRevenueDTO, TopDoctorDTO } from "../../../types/admin/doctorAnalytics";

interface IAdminDashboardRepository {
    getTotalRevenue(): Promise<number>;
    getActiveSubscriptionCount(): Promise<number>;
    getMostSubscribedPlans(
        limit?: number
    ): Promise<{ planName: string; subscriptionCount: number }[]>;
    getRevenueTrend(
        startDate: Date,
        endDate: Date,
        interval: "day" | "week" | "month"
    ): Promise<RevenueTrendDTO[]>;

    getPlanDistribution(
        startDate?: Date,
        endDate?: Date
    ): Promise<PlanDistributionDTO[]>;

    getSubscriptionsForReport(
        startDate?: Date,
        endDate?: Date
    ): Promise<IDoctorSubscriptionPopulated[]>;

    getDoctorAnalyticsSummary(): Promise<DoctorAnalyticsSummaryDTO[]>;
    getDoctorRevenueTrend(
        startDate: Date,
        endDate: Date,
        interval: "day" | "month"
    ): Promise<RevenueDoctorTrendDTO[]>;

    getServiceRevenue(): Promise<ServiceRevenueDTO[]>;
    getTopPerformingDoctors(limit?: number): Promise<TopDoctorDTO[]>;
}

export default IAdminDashboardRepository;
