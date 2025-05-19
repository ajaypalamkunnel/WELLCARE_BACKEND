// dtos/subscriptionAnalytics.dto.ts
import { IDoctorSubscription } from "../../model/subscription/doctorSubscriptions"; 


export interface TopPlanDTO {
    planName: string;
    subscriptionCount: number;
}

export interface SubscriptionOverviewDTO {
    totalRevenue: number;
    activeSubscriptions: number;
    topPlans: TopPlanDTO[];
}


export interface RevenueTrendDTO {
    label: string;       // e.g. 2024-05-01 or "Week 22"
    totalRevenue: number;
    transactionCount: number;
}


export interface PlanDistributionDTO {
    planName: string;
    subscriptionCount: number;
}


export interface SubscriptionReportDownloadDTO {
    downloadUrl: string;
  }
  

 
export interface IDoctorSubscriptionPopulated extends Omit<IDoctorSubscription, "doctorId" | "planId"> {
  doctorId: {
    fullName: string;
    email: string;
  };
  planId: {
    planName: string;
    finalPrice: number;
  };
}
