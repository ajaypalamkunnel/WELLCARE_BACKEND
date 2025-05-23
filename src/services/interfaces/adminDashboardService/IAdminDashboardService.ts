import {
  PlanDistributionDTO,
  RevenueTrendDTO,
  SubscriptionOverviewDTO,
  SubscriptionReportDownloadDTO,
} from "../../../types/admin/adminDashboardDto";
import {
  DoctorAnalyticsSummaryDTO,
  RevenueDoctorTrendDTO,
  ServiceRevenueDTO,
  TopDoctorDTO,
} from "../../../types/admin/doctorAnalytics";

interface IAdminDashboardService {
  getOverview(): Promise<SubscriptionOverviewDTO>;
  getRevenueTrend(
    startDate: Date,
    endDate: Date,
    interval: "day" | "week" | "month"
  ): Promise<RevenueTrendDTO[]>;
  getPlanDistribution(
    startDate?: Date,
    endDate?: Date
  ): Promise<PlanDistributionDTO[]>;

  generateSubscriptionReport(
    startDate: Date,
    endDate: Date,
    format: "pdf" | "excel"
  ): Promise<SubscriptionReportDownloadDTO>;

  getDoctorAnalyticsSummary(): Promise<DoctorAnalyticsSummaryDTO[]>;

  getDoctorRevenueTrend(
    startDate: Date,
    endDate: Date,
    interval: "day" | "month"
  ): Promise<RevenueDoctorTrendDTO[]>;

  getServiceRevenue(): Promise<ServiceRevenueDTO[]>;

  getTopPerformingDoctors(): Promise<TopDoctorDTO[]>;
}

export default IAdminDashboardService;
