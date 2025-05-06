
export interface AppointmentStatusSummary {
    total: number;
    booked: number;
    completed: number;
    cancelled: number;
    pending: number;
  }
  export interface AppointmentTrendData {
    dateLabel: string;
    booked: number;
    completed: number;
    cancelled: number;
  }
  
  export interface RevenueTrendData {
    label: string; 
    totalRevenue: number;
    count: number; 
  }
  
  export interface TopServiceData {
    serviceName: string;
    totalAppointments: number;
    totalRevenue: number;
  }