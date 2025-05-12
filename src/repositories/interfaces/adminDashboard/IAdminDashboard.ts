import { IDoctorSubscription } from "../../../model/subscription/doctorSubscriptions";
import {
    IDoctorSubscriptionPopulated,
    PlanDistributionDTO,
    RevenueTrendDTO,
} from "../../../types/admin/adminDashboardDto";

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

    getDoctorAnalyticsSummary(): Promise<any[]>;
    getDoctorRevenueTrend(
        startDate: Date,
        endDate: Date,
        interval: "day" | "month"
    ): Promise<any[]>;

    getServiceRevenue(): Promise<any[]>;
    getTopPerformingDoctors(limit?: number): Promise<any[]>;
}

export default IAdminDashboardRepository;
