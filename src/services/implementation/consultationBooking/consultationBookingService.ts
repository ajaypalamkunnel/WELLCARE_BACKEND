import mongoose, { Types } from "mongoose";
import { StatusCode } from "../../../constants/statusCode";
import { ISlot, SlotStatus } from "../../../model/doctorService/doctorSchedule";
import { IDoctorService } from "../../../model/doctorService/doctorServicesModal";
import IConsultationBookingRepository from "../../../repositories/interfaces/consultationBooking/IConsultationBookingRepository";
import IDoctorScheduleRepository from "../../../repositories/interfaces/doctorService/IDoctorScheduleRepository";
import { AppointmentDetailDTO, DoctorAppointmentDetailDTO, InitiateBookingResponse, PaginatedAppointmentListDTO, PopulatedServiceId, Reason, VerifyAndBookResponse } from "../../../types/bookingTypes";
import { CustomError } from "../../../utils/CustomError";
import IConsultationBookingService from "../../interfaces/consultationBooking/IConsultationBookingService";
import DoctorServiceRepository from "../../../repositories/implementation/doctorService/doctorServiceRepository";
import IDoctorServiceRepository from "../../../repositories/interfaces/doctorService/IDoctorServiceRepository";
import { razorpayInstance } from "../../../utils/razorpayUtils";
import PaymentModel from "../../../model/bookingPayment/bookingPayment";
import crypto from "crypto";
import IWalletRepository from "../../../repositories/interfaces/wallet/IWalletRepository";
import IWalletService from "../../interfaces/wallet/IWalletService";
import IDoctorWalletRepository from "../../../repositories/interfaces/doctorWallet/IDoctorWallet";
import { io } from "../../../index";
import { sendNotificationToUser } from "../../../utils/notification/sendNotification";
import dayjs from "dayjs";

class ConsultationBookingService implements IConsultationBookingService {

    private _consultationBookingRepository: IConsultationBookingRepository
    private _doctorScheduleRepository: IDoctorScheduleRepository
    private _doctorServiceRepository: IDoctorServiceRepository
    private _walletRepository: IWalletRepository
    private _walletService: IWalletService
    private _doctorWalletRepository: IDoctorWalletRepository


    constructor(consultationBookingRepository: IConsultationBookingRepository, doctorScheduleRepository: IDoctorScheduleRepository, doctorServiceRepository: IDoctorServiceRepository, walletRepository: IWalletRepository, walletService: IWalletService, doctorWalletRepository: IDoctorWalletRepository) {
        this._consultationBookingRepository = consultationBookingRepository
        this._doctorScheduleRepository = doctorScheduleRepository
        this._doctorServiceRepository = doctorServiceRepository
        this._walletRepository = walletRepository
        this._walletService = walletService
        this._doctorWalletRepository = doctorWalletRepository

    }





    async getBookingDetails(bookingId: string, slotId: string): Promise<IConsultationBookingService & ISlot> {
        try {

            const booking = await this._consultationBookingRepository.getABookingDetails(
                bookingId
            );


            if (!booking) {
                throw new CustomError("Booking not found", StatusCode.NOT_FOUND);
            }


            const schedule: any = booking.doctorScheduleId

            const selectdSlot = schedule.availability.find((slot: ISlot) => {
                return slot.slot_id.toString() === slotId
            })


            

            if (!selectdSlot) {
                throw new CustomError("Slot not found in schedule", StatusCode.NOT_FOUND);
            }

            const bookingObj = booking.toObject()
            if (bookingObj.doctorScheduleId && bookingObj.doctorScheduleId.availability) {
                delete bookingObj.doctorScheduleId.availability;
            }


            return {
                ...bookingObj,
                selectdSlot,
            }



        } catch (error) {

            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError("Failed to fetch booking details",
                    StatusCode.INTERNAL_SERVER_ERROR)
            }


        }
    }


    async initiateBooking(data: { patientId: string; doctorScheduleId: string; slotId: string; }): Promise<InitiateBookingResponse> {
        try {

            const { doctorScheduleId, slotId } = data;

            console.log(doctorScheduleId, slotId);


            const schedule = await this._doctorScheduleRepository.getScheduleBySlot(doctorScheduleId, slotId)

            console.log("✅--->", schedule);

            if (!schedule) {
                throw new CustomError("Slot is either booked or invalid", StatusCode.CONFLICT)
            }

            const slot = schedule.availability.find((s: ISlot) => s.slot_id.toString() === slotId)

            if (!slot) {
                throw new CustomError("Slot not found in schedule", StatusCode.BAD_REQUEST)
            }


            const marked = await this._doctorScheduleRepository.markSlotAsPending(doctorScheduleId,slot.slot_id.toString())

            if (!marked) {
                throw new CustomError("Slot is already booked or being processed", StatusCode.CONFLICT);
              }

            const serviceFee = (schedule.serviceId as unknown as PopulatedServiceId).fee;


            const amount = serviceFee
            console.log("paisa ithaatoo, ", amount);


            const razorpayOrder = await razorpayInstance.orders.create({
                amount: amount! * 100,
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
            });

            await this._consultationBookingRepository.storeInitialPayment({
                razorpayOrderId: razorpayOrder.id,
                amount,
                currency: "INR",
                status: "created"
            })


            return {
                orderId: razorpayOrder.id,
                amount: amount!,
                currency: "INR",
            }


        } catch (error) {

            if (error instanceof CustomError) {
                throw error
            }

            throw new CustomError("Failed to initiate booking", StatusCode.INTERNAL_SERVER_ERROR);

        }
    }



    async verifyAndBook(data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; patientId: string; doctorScheduleId: string; slotId: string; departmentId: string; doctorId: string; serviceId: string; appointmentDate: string; }): Promise<VerifyAndBookResponse> {
        try {



            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                patientId,
                doctorScheduleId,
                slotId,
                departmentId,
                doctorId,
                serviceId,
                appointmentDate,
            } = data;

            console.log("going to verify and booking==>", data);

            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");


            if (expectedSignature !== razorpay_signature) {
                await this._consultationBookingRepository.markPaymentFailed(razorpay_order_id)
                throw new CustomError("Payment verification failed", StatusCode.BAD_REQUEST);
            }

            const existingPayment = await this._consultationBookingRepository.getPaymentByOrderId(razorpay_order_id);

            if (!existingPayment || existingPayment.status !== "created") {
                throw new CustomError("Invalid or already processed payment", StatusCode.BAD_REQUEST);
            }

            // ivade kurach prashname und pinnes set akka

            const schedule = await this._doctorScheduleRepository.findPendingSlot(doctorScheduleId, slotId)

            console.log("ivade ille???", schedule);



            if (!schedule) {
                await this._consultationBookingRepository.markPaymentFailed(razorpay_order_id)
                throw new CustomError("Slot is already booked or invalid", StatusCode.CONFLICT);
            }


            const serviceFee = (schedule.serviceId as unknown as PopulatedServiceId).fee;

            console.log("paisaa -->", serviceFee);



            const result = await this._consultationBookingRepository.createBookingWithPayment(

                {
                    patientId: new Types.ObjectId(patientId),
                    doctorScheduleId: new Types.ObjectId(doctorScheduleId),
                    slotId: new Types.ObjectId(slotId),
                    departmentId: new Types.ObjectId(departmentId),
                    appointmentDate: schedule.date,
                    doctorId: new Types.ObjectId(doctorId),
                    serviceId: new Types.ObjectId(serviceId),
                    status: "booked",
                    paymentStatus: "paid",
                },
                {
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: "paid",
                    currency: "INR",
                    amount: serviceFee,
                }

            )

            const doctorObjectId = new Types.ObjectId(doctorId)

         
          
            
            await sendNotificationToUser(
                io,
                doctorId,
                "Doctor",
                "New Appointment Booked",
                `An appointment has been booked by a patient on ${dayjs(schedule.date).format("DD MMM YYYY")}`,
            )

            await sendNotificationToUser(
                io,
                patientId,
                "user",
                "Booking Confirmed",
                `Your appointment with the doctor is confirmed for ${dayjs(schedule.date).format("DD MMM YYYY")}`,
                `/patient/appointments`
            )



            return {
                bookingId: result.appointment._id.toString(),
                slot_id: slotId,
                status: "success",

            }



        } catch (error) {

            console.error("verifyAndBook error:", error);

            if (error instanceof CustomError) {
                throw error
            }

            throw new CustomError("Booking failed", StatusCode.INTERNAL_SERVER_ERROR);

        }
    }


    async getUserAppointments(patientId: string, statusKey: SlotStatus): Promise<any[]> {

        try {

            const statusMap: Record<string, SlotStatus[]> = {
                upcoming: ["booked", "pending", "rescheduled"],
                completed: ["completed"],
                cancelled: ["cancelled"],
            };

            const statusList = statusMap[statusKey];

            if (!statusList) {
                throw new CustomError("Invalid appointment status filter", StatusCode.BAD_REQUEST);
            }

            const results = await this._consultationBookingRepository.findAppointmentsByPatientAndStatus(
                patientId,
                statusList
            )

            return results

        } catch (error) {

            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError("Internal server error", StatusCode.INTERNAL_SERVER_ERROR)
            }
        }
    }



    async getAppoinmentDetailsById(appoinmentId: Types.ObjectId, patientId: Types.ObjectId): Promise<AppointmentDetailDTO> {

        try {

            if (!Types.ObjectId.isValid(appoinmentId.toString())) {
                throw new CustomError("Invalid appointment ID", StatusCode.BAD_REQUEST)
            }

            const appointment = await this._consultationBookingRepository.findAppoinmentDetailById(appoinmentId, patientId)

            if (!appointment) {
                throw new CustomError("Appoinment not found", StatusCode.NOT_FOUND)
            }
            return appointment
        } catch (error) {

            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError("Internal server error", StatusCode.INTERNAL_SERVER_ERROR)
            }

        }
    }



    async cancelAppointment(patientId: Types.ObjectId, appointmentId: Types.ObjectId, reason?: string): Promise<{ refund: { status: string; amount: number; }; }> {
        try {
            if (!Types.ObjectId.isValid(appointmentId.toString())) {
                throw new CustomError("Invalid appointment ID", StatusCode.BAD_REQUEST)
            }


            const appointment = await this._consultationBookingRepository.findByIdAndPatient(
                appointmentId,
                patientId
            )


            if (!appointment) {
                throw new CustomError("Appointment not Found", StatusCode.NOT_FOUND)
            }


            const schedule = await this._doctorScheduleRepository.findById(appointment.doctorScheduleId.toString())

            if (!schedule) {
                throw new CustomError("Doctor schedule not found", StatusCode.NOT_FOUND)
            }

           


            const slot = schedule.availability.find(slot => {
                return slot.slot_id.toString() === appointment.slotId.toString()
            })

          


            if (!slot) {
                throw new CustomError("Slot not found in schedule", StatusCode.NOT_FOUND)
            }

            const slotStartTime = new Date(slot.start_time);

            const now = new Date()
            const isEligibleForRefund = slotStartTime.getTime() - now.getTime() >= 4 * 60 * 60 * 1000;


            const service = await this._doctorServiceRepository.findById(appointment.serviceId.toString())


            if (!service) {
                throw new CustomError("Service not found", StatusCode.NOT_FOUND)
            }




            const refundAmount = isEligibleForRefund ? service.fee : 0

            if (isEligibleForRefund) {
                await this._walletService.creditRefund(
                    patientId,
                    refundAmount,
                    "Appoinement Refund",
                    appointment._id

                )
            } else {
                await this._doctorWalletRepository.addTransaction(
                    service.doctorId.toString(),
                    refundAmount,
                    "credit",
                    Reason.AppointmentCancelNotERefund,
                    appointmentId.toString(),
                    "success",
                )
            }


            // Update appointment as cancelled

            await this._consultationBookingRepository.updateAppointmentCancellation(appointment._id, {
                status: "cancelled",
                cancellation: {
                    reason: reason || "Not specific",
                    cancelledAt: now,
                    refundStatus: isEligibleForRefund ? "eligible" : "not_eligible",
                    refundAmount: refundAmount
                }
            })

            return {
                refund: {
                    status: isEligibleForRefund ? "eligible" : "not_eligible",
                    amount: refundAmount
                }

            }
        } catch (error) {
            console.error("Cancellation failed:", error);

            throw error instanceof CustomError ? error : new CustomError("Failed to cancel appointment", StatusCode.INTERNAL_SERVER_ERROR)

        }
    }


    async findAppointmentsForDoctor(doctorId: Types.ObjectId, filters: { date?: string; mode?: string; status?: string; page?: number; limit?: number; }): Promise<PaginatedAppointmentListDTO> {
        try {

            if (!doctorId) {
                throw new CustomError("Unauthorized access", StatusCode.UNAUTHORIZED)
            }

            const appointment = await this._consultationBookingRepository.findAppointmentsForDoctor(doctorId, filters)




            return appointment

        } catch (error) {

            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError("Failed to fetch appointments", StatusCode.INTERNAL_SERVER_ERROR)
            }

        }
    }


    async getAppointmentDetailForDoctor(appointmentId: string, doctorId: Types.ObjectId): Promise<DoctorAppointmentDetailDTO> {
        try {

            if (!Types.ObjectId.isValid(appointmentId)) {
                throw new CustomError("Invalid appointment ID", StatusCode.BAD_GATEWAY)
            }

            const appointmentObjectId = new Types.ObjectId(appointmentId)

            const detail = await this._consultationBookingRepository.findAppointmentDetailForDoctor(
                appointmentObjectId,
                doctorId
            )

            if (!detail) {
                throw new CustomError("Appointment not found or access denied", StatusCode.NOT_FOUND);
            }




            return detail;


        } catch (error) {
            console.error(" Error in getAppointmentDetailForDoctor:", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to retrieve appointment details", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}























export default ConsultationBookingService