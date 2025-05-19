import { Types } from "mongoose";
import { ISlot, SlotStatus } from "../../../model/doctorService/doctorSchedule";
import {
  AppointmentDetailDTO,
  DoctorAppointmentDetailDTO,
  InitiateBookingResponse,
  PaginatedAppointmentListDTO,
  VerifyAndBookResponse,
} from "../../../types/bookingTypes";
import { IConsultationAppointment } from "../../../model/consultationBooking/consultationBooking";

interface IConsultationBookingService {
  initiateBooking(data: {
    patientId: string;
    doctorScheduleId: string;
    slotId: string;
  }): Promise<InitiateBookingResponse>;

  verifyAndBook(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    patientId: string;
    doctorScheduleId: string;
    slotId: string;
    departmentId: string;
    doctorId: string;
    serviceId: string;
    appointmentDate: string;
  }): Promise<VerifyAndBookResponse>;

  getBookingDetails(
    bookingId: string,
    slotId: string
  ): Promise<IConsultationBookingService & ISlot>;

  getUserAppointments(patientId: string, statusKey: SlotStatus): Promise<IConsultationAppointment[]>;

  getAppoinmentDetailsById(
    appoinmentId: Types.ObjectId,
    patientId: Types.ObjectId
  ): Promise<AppointmentDetailDTO>;

  cancelAppointment(
    patientId: Types.ObjectId,
    appointmentId: Types.ObjectId,
    reason?: string
  ): Promise<{ refund: { status: string; amount: number } }>;

  findAppointmentsForDoctor(
    doctorId: Types.ObjectId,
    filters: {
      date?: string;
      mode?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedAppointmentListDTO>;

  getAppointmentDetailForDoctor(
    appointmentId: string,
    doctorId: Types.ObjectId
  ): Promise<DoctorAppointmentDetailDTO>;
}

export default IConsultationBookingService;
