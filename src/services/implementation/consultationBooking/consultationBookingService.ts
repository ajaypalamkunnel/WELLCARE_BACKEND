import mongoose, { Types } from "mongoose";
import { StatusCode } from "../../../constants/statusCode";
import { ISlot, SlotStatus } from "../../../model/doctorService/doctorSchedule";
import { IDoctorService } from "../../../model/doctorService/doctorServicesModal";
import IConsultationBookingRepository from "../../../repositories/interfaces/consultationBooking/IConsultationBookingRepository";
import IDoctorScheduleRepository from "../../../repositories/interfaces/doctorService/IDoctorScheduleRepository";
import { InitiateBookingResponse, PopulatedServiceId, VerifyAndBookResponse } from "../../../types/bookingTypes";
import { CustomError } from "../../../utils/CustomError";
import IConsultationBookingService from "../../interfaces/consultationBooking/IConsultationBookingService";
import DoctorServiceRepository from "../../../repositories/implementation/doctorService/doctorServiceRepository";
import IDoctorServiceRepository from "../../../repositories/interfaces/doctorService/IDoctorServiceRepository";
import { razorpayInstance } from "../../../utils/razorpayUtils";
import PaymentModel from "../../../model/bookingPayment/bookingPayment";
import crypto from "crypto";


class ConsultationBookingService implements IConsultationBookingService {

    private _consultationBookingRepository: IConsultationBookingRepository
    private _doctorScheduleRepository: IDoctorScheduleRepository
    private _doctorServiceRepository: IDoctorServiceRepository


    constructor(consultationBookingRepository: IConsultationBookingRepository, doctorScheduleRepository: IDoctorScheduleRepository, doctorServiceRepository: IDoctorServiceRepository) {
        this._consultationBookingRepository = consultationBookingRepository
        this._doctorScheduleRepository = doctorScheduleRepository
        this._doctorServiceRepository = doctorServiceRepository
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
               return  slot.slot_id.toString() === slotId
            })


            console.log("Selected slot==>", selectdSlot)

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

            console.log("service inn eathii");





            const { doctorScheduleId, slotId } = data;

            console.log(doctorScheduleId, slotId);


            const schedule = await this._doctorScheduleRepository.getScheduleBySlot(doctorScheduleId, slotId)

            console.log("--->", schedule);




            if (!schedule) {
                throw new CustomError("Slot is either booked or invalid", StatusCode.CONFLICT)
            }

            const slot = schedule.availability.find((s: ISlot) => s.slot_id.toString() === slotId)

            if (!slot) {
                throw new CustomError("Slot not found in schedule", StatusCode.BAD_REQUEST)
            }


            console.log("===>", slot);

            console.log("******", schedule.serviceId);


            const serviceFee = (schedule.serviceId as unknown as PopulatedServiceId).fee;


            // const service = await this._doctorServiceRepository.findById(serviceId)


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
            
            console.log("going to verify and booking==>",data);

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

            // ivade kurach prashname und pinnes set akkak

            const schedule = await this._doctorScheduleRepository.findAvailableSlot(doctorScheduleId, slotId)

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



            return {
                bookingId: result.appointment._id.toString(),
                slot_id: slotId,
                status: "success"
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
            
            if(error instanceof CustomError){
                throw error
            }else{
                throw new CustomError("Internal server error",StatusCode.INTERNAL_SERVER_ERROR)
            }
        }
    }











}

export default ConsultationBookingService