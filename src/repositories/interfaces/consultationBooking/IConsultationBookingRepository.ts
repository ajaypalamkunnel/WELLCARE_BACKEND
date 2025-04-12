import { Types, UpdateWriteOpResult } from "mongoose";
import { IPayment } from "../../../model/bookingPayment/bookingPayment";
import { IConsultationAppointment } from "../../../model/consultationBooking/consultationBooking";
import { SlotStatus } from "../../../model/doctorService/doctorSchedule";
import { AppointmentDetailDTO } from "../../../types/bookingTypes";


interface IConsultationBookingRepository {

    createBookingWithPayment(
        appointmentData: Partial<IConsultationAppointment>,
        paymentData: Partial<IPayment>
    ): Promise<{ appointment: IConsultationAppointment; payment: IPayment }>


    storeInitialPayment(paymentData:Partial<IPayment>):Promise<Partial<IPayment>>

    markPaymentFailed(razorpayOrderId: string):Promise<UpdateWriteOpResult>


    getPaymentByOrderId(orderId: string): Promise<IPayment | null>;

    getABookingDetails(bookingId:string):Promise<IConsultationAppointment>

    findAppointmentsByPatientAndStatus(
        patientId: string,
        statusList: SlotStatus[]
      ): Promise<any[]>;

    findAppoinmentDetailById(appointmentId:Types.ObjectId,patientId:Types.ObjectId):Promise<AppointmentDetailDTO|null>

    findByIdAndPatient(
        appointmentId: Types.ObjectId,
        patientId: Types.ObjectId
      ): Promise<IConsultationAppointment | null>;
    
      updateAppointmentCancellation(
        appointmentId: Types.ObjectId,
        updateData: Partial<IConsultationAppointment>
      ): Promise<IConsultationAppointment | null>; 
}

export default IConsultationBookingRepository