
import mongoose, { PipelineStage, Types } from "mongoose";
import PaymentModel, { IPayment } from "../../../model/bookingPayment/bookingPayment";
import ConsultationAppointmentModal, { IConsultationAppointment } from "../../../model/consultationBooking/consultationBooking";
import { BaseRepository } from "../../base/BaseRepository";
import IConsultationBookingRepository from "../../interfaces/consultationBooking/IConsultationBookingRepository";
import DoctorSchedules, { SlotStatus } from "../../../model/doctorService/doctorSchedule";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";


class ConsultationBookingRepository extends BaseRepository<IConsultationAppointment> implements IConsultationBookingRepository {

    constructor() {
        super(ConsultationAppointmentModal)
    }

    async getABookingDetails(bookingId: string): Promise<IConsultationAppointment> {
        try {

            const result = await ConsultationAppointmentModal.findById({ _id: bookingId })
                .populate({
                    path: "doctorId",
                    select: "fullName specialization experience profileImage", // or whatever fields you want
                })
                .populate({
                    path: "departmentId",
                    select: "name",
                })
                .populate({
                    path: "serviceId",
                    select: "name fee mode",
                })
                .populate({
                    path: "doctorScheduleId",
                    select: "date availability start_time end_time",
                })

            if (!result) {
                throw new CustomError("Booking not found", StatusCode.NOT_FOUND)
            }

            return result

        } catch (error) {

            if (error instanceof CustomError) {
                throw new CustomError(error.message, error.statusCode)
            } else {
                throw new CustomError("Internal Server error", StatusCode.INTERNAL_SERVER_ERROR)
            }



        }
    }

    async createBookingWithPayment(
        appointmentData: Partial<IConsultationAppointment>,
        paymentData: Partial<IPayment>
    ): Promise<{ appointment: IConsultationAppointment; payment: IPayment }> {

        const session = await mongoose.startSession()
        session.startTransaction();


        console.log(" Incoming appointment data:", appointmentData);
        console.log(" Incoming payment data:", paymentData);



        try {
            const doctorSchedule = await DoctorSchedules.findOneAndUpdate(
                {
                    _id: appointmentData.doctorScheduleId,
                    "availability.slot_id": appointmentData.slotId,
                    "availability.status": "available"
                },
                {
                    $set: { "availability.$.status": "booked" }
                },
                { session, new: true }
            )

            console.log(" DoctorSchedule updated:", doctorSchedule);


            if (!doctorSchedule) {
                throw new CustomError("Slot already booked or Invalid", StatusCode.CONFLICT)
            }

            const [appointment] = await ConsultationAppointmentModal.create([appointmentData], { session })


            console.log(" Appointment created:", appointment);

            paymentData.appointmentId = appointment._id
            const [payment] = await PaymentModel.create([paymentData], { session });

            console.log(" Payment created:", payment);

            await session.commitTransaction();
            session.endSession();

            return { appointment, payment };
        } catch (error) {

            await session.abortTransaction();

            console.error(" Booking failure detail:", error);

            if (error instanceof CustomError) {
                throw error
            }

            throw new CustomError("Booking failed", StatusCode.INTERNAL_SERVER_ERROR)

        } finally {
            session.endSession()

        }


    }

    async storeInitialPayment(paymentData: Partial<IPayment>) {
        return await PaymentModel.create(paymentData)
    }

    async markPaymentFailed(razorpayOrderId: string) {
        return await PaymentModel.updateOne({ razorpayOrderId }, { status: "failed" })
    }

    async getPaymentByOrderId(orderId: string): Promise<IPayment | null> {
        return await PaymentModel.findOne({ razorpayOrderId: orderId });
    }



   async findAppointmentsByPatientAndStatus(patientId: string, statusList: SlotStatus[]): Promise<any[]> {
        try {

            const pipeline:PipelineStage[] = [
                {
                    $match: {
                        patientId: new Types.ObjectId(patientId),
                        status: { $in: statusList },
                        appointmentDate: { $gte: new Date() } // Filter only upcoming/future appointments
                    },


                },
                {
                    $lookup: {
                        from: "doctorschedules",
                        localField: "doctorScheduleId",
                        foreignField: "_id",
                        as: "schedule"
                    }
                },
                { $unwind: "$schedule" },
                {
                    $addFields: {
                      slot: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$schedule.availability",
                              as: "slot",
                              cond: { $eq: ["$$slot.slot_id", "$slotId"] }
                            }
                          },
                          0
                        ]
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: "doctors",
                      localField: "doctorId",
                      foreignField: "_id",
                      as: "doctor"
                    }
                  },
                  { $unwind: "$doctor" },
                  {
                    $sort: {
                      appointmentDate: 1,
                      "slot.start_time": 1
                    }
                  },
                  {
                    $project: {
                      _id: 1,
                      appointmentDate: 1,
                      status: 1,
                      "slot.start_time": 1,
                      doctor: {
                        _id: 1,
                        fullName: 1,
                        specialization: 1,
                        profileImage: 1
                      }
                    }
                  }

            ]

            const results = await ConsultationAppointmentModal.aggregate(pipeline);
            return results;
        } catch (error) {

            throw new CustomError("Failed to fetch appointments", StatusCode.INTERNAL_SERVER_ERROR)

        }
    }






}


export default ConsultationBookingRepository