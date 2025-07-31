export interface ServiceDTO {
  _id: string;
  name: string;
  mode: 'Online' | 'In-Person' | 'Both';
  fee: number;
}

export interface SlotDTO {
  slot_id: string;
  start_time: Date;
  end_time: Date;
  status: 'available' | 'booked' | 'cancelled' | 'completed' | 'pending' | 'rescheduled';
  is_break: boolean;
}

export interface DoctorScheduleDTO {
  _id: string;
  doctorId: string;
  serviceId: ServiceDTO;
  date: Date;
  start_time: Date;
  end_time: Date;
  duration: number;
  isCancelled: boolean;
  cancellationReason?: string;
  cancelledAt?: Date;
  availability: SlotDTO[];
}
