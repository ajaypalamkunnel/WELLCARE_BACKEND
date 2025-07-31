

export interface DoctorAnalyticsSummaryDTO {
    doctorId: string;
    fullName: string;
    totalRevenue: number;
    completedAppointments: number;
    averageFee: number;
    retentionRate: number;
}


export interface RevenueDoctorTrendDTO {
    label: string;         // formatted date
    doctorId: string;
    fullName: string;
    revenue: number;
}


export interface ServiceRevenueDTO {
    serviceName: string;
    revenue: number;
}


export interface TopDoctorDTO {
    doctorId: string;
    fullName: string;
    totalRevenue: number;
    appointmentCount: number;
}