import { UpdateWriteOpResult } from "mongoose";
import { IPayment } from "../../../model/bookingPayment/bookingPayment";
import { IConsultationAppointment } from "../../../model/consultationBooking/consultationBooking";
import { SlotStatus } from "../../../model/doctorService/doctorSchedule";


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


}

export default IConsultationBookingRepository