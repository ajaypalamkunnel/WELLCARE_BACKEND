import { ISlot, SlotStatus } from "../../../model/doctorService/doctorSchedule";
import { InitiateBookingResponse, VerifyAndBookResponse } from "../../../types/bookingTypes";


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

}

export default IConsultationBookingService