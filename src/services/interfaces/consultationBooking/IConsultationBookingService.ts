import { Types } from "mongoose";
import { ISlot, SlotStatus } from "../../../model/doctorService/doctorSchedule";
import { AppointmentDetailDTO, InitiateBookingResponse, VerifyAndBookResponse } from "../../../types/bookingTypes";


interface IConsultationBookingService{

    initiateBooking(data: {
        patientId: string;
        doctorScheduleId: string;
        slotId: string;
      }): Promise<InitiateBookingResponse> 



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
      }): Promise<VerifyAndBookResponse>


      getBookingDetails(bookingId:string,slotId:string):Promise<IConsultationBookingService & ISlot>

      getUserAppointments(
        patientId: string,
        statusKey: SlotStatus
      ): Promise<any[]>


      getAppoinmentDetailsById(
        appoinmentId:Types.ObjectId,
        patientId:Types.ObjectId
      ):Promise<AppointmentDetailDTO>



      cancelAppointment(
        patientId: Types.ObjectId,
        appointmentId: Types.ObjectId,
        reason?: string
      ): Promise<{ refund: { status: string; amount: number } }>;

}

export default IConsultationBookingService