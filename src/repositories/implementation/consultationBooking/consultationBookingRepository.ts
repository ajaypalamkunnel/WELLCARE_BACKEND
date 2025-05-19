import mongoose, { PipelineStage, Types } from "mongoose";
import PaymentModel, {
    IPayment,
} from "../../../model/bookingPayment/bookingPayment";
import ConsultationAppointmentModal, {
    IConsultationAppointment,
} from "../../../model/consultationBooking/consultationBooking";
import { BaseRepository } from "../../base/BaseRepository";
import IConsultationBookingRepository from "../../interfaces/consultationBooking/IConsultationBookingRepository";
import DoctorSchedules, {
    SlotStatus,
} from "../../../model/doctorService/doctorSchedule";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import {
    AppointmentDetailDTO,
    bookingFeeDTO,
    DoctorAppointmentDetailDTO,
    PaginatedAppointmentListDTO,
} from "../../../types/bookingTypes";
import { startOfDay, endOfDay, addDays } from "date-fns";

class ConsultationBookingRepository
    extends BaseRepository<IConsultationAppointment>
    implements IConsultationBookingRepository {
    constructor() {
        super(ConsultationAppointmentModal);
    }

    async getABookingDetails(
        bookingId: string
    ): Promise<IConsultationAppointment> {
        try {
            const result = await ConsultationAppointmentModal.findById({
                _id: bookingId,
            })
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
                });

            if (!result) {
                throw new CustomError("Booking not found", StatusCode.NOT_FOUND);
            }

            return result;
        } catch (error) {
            if (error instanceof CustomError) {
                throw new CustomError(error.message, error.statusCode);
            } else {
                throw new CustomError(
                    "Internal Server error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async createBookingWithPayment(
        appointmentData: Partial<IConsultationAppointment>,
        paymentData: Partial<IPayment>
    ): Promise<{ appointment: IConsultationAppointment; payment: IPayment }> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const doctorSchedule = await DoctorSchedules.findOne({
                _id: appointmentData.doctorScheduleId,
                "availability.slot_id": appointmentData.slotId,
                "availability.status": "pending",
            }).session(session);


            if (!doctorSchedule) {
                throw new CustomError(
                    "Slot already booked or Invalid",
                    StatusCode.CONFLICT
                );
            }

            const updatedSchedule = await DoctorSchedules.findOneAndUpdate(
                {
                    _id: appointmentData.doctorScheduleId,
                    "availability.slot_id": appointmentData.slotId,
                    "availability.status": "pending",
                },
                {
                    $set: { "availability.$[elem].status": "booked" },
                },
                {
                    arrayFilters: [{ "elem.slot_id": appointmentData.slotId }],
                    session,
                    new: true,
                }
            );

            console.log("updated schedule: ",updatedSchedule);
            

            

            const [appointment] = await ConsultationAppointmentModal.create(
                [appointmentData],
                { session }
            );



            paymentData.appointmentId = appointment._id;
            const [payment] = await PaymentModel.create([paymentData], { session });

           

            await session.commitTransaction();
            session.endSession();

            return { appointment, payment };
        } catch (error) {
            await session.abortTransaction();

            console.error("❌ Booking failure detail:", error);

            if (error instanceof CustomError) {
                throw error;
            }

            throw new CustomError("Booking failed", StatusCode.INTERNAL_SERVER_ERROR);
        } finally {
            session.endSession();
        }
    }

    async storeInitialPayment(paymentData: Partial<IPayment>) {
        return await PaymentModel.create(paymentData);
    }

    async markPaymentFailed(razorpayOrderId: string) {
        return await PaymentModel.updateOne(
            { razorpayOrderId },
            { status: "failed" }
        );
    }

    async getPaymentByOrderId(orderId: string): Promise<IPayment | null> {
        return await PaymentModel.findOne({ razorpayOrderId: orderId });
    }

    async findAppointmentsByPatientAndStatus(
        patientId: string,
        statusList: SlotStatus[]
    ): Promise<IConsultationAppointment[]> {
        

        try {

            const filterWithFutureDate = ["booked", "pending", "rescheduled"];

            const shouldFilterByDate = statusList.every((status) =>
                filterWithFutureDate.includes(status)
            );

            const matchStage: Record<string, any> = {
                patientId: new Types.ObjectId(patientId),
                status: { $in: statusList },
            };

            // Apply future date filter conditionally
            if (shouldFilterByDate) {
                matchStage.appointmentDate = { $gte: new Date() };
            }


            const pipeline: PipelineStage[] = [

                { $match: matchStage }
                ,
                {
                    $lookup: {
                        from: "doctorschedules",
                        localField: "doctorScheduleId",
                        foreignField: "_id",
                        as: "schedule",
                    },
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
                                        cond: { $eq: ["$$slot.slot_id", "$slotId"] },
                                    },
                                },
                                0,
                            ],
                        },
                    },
                },
                {
                    $lookup: {
                        from: "doctors",
                        localField: "doctorId",
                        foreignField: "_id",
                        as: "doctor",
                    },
                },
                { $unwind: "$doctor" },
                {
                    $sort: {
                        appointmentDate: 1,
                        "slot.start_time": 1,
                    },
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
                            profileImage: 1,
                        },
                    },
                },
            ];

            const results = await ConsultationAppointmentModal.aggregate(pipeline);
            

            return results;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error
            } else {
                throw new CustomError(
                    "Failed to fetch appointments",
                    StatusCode.INTERNAL_SERVER_ERROR
                );

            }
        }
    }

    async findAppoinmentDetailById(
        appointmentId: Types.ObjectId,
        patientId: Types.ObjectId
    ): Promise<AppointmentDetailDTO | null> {
        try {

            const pipeline: PipelineStage[] = [
                {
                    $match: {
                        _id: appointmentId,
                        patientId: patientId,
                    },
                },
                {
                    $lookup: {
                        from: "doctors",
                        localField: "doctorId",
                        foreignField: "_id",
                        as: "doctor",
                    },
                },
                { $unwind: "$doctor" },
                {
                    $lookup: {
                        from: "doctorschedules",
                        localField: "doctorScheduleId",
                        foreignField: "_id",
                        as: "schedule",
                    },
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
                                        cond: { $eq: ["$$slot.slot_id", "$slotId"] },
                                    },
                                },
                                0,
                            ],
                        },
                    },
                },
                {
                    $lookup: {
                        from: "prescriptions",
                        localField: "prescriptionId",
                        foreignField: "_id",
                        as: "prescription",
                    },
                },

                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                {
                    $unwind: "$service",
                },

                {
                    $project: {
                        _id: 1,
                        appointmentDate: 1,
                        status: 1,
                        prescriptionUrl: 1,
                        paymentStatus: 1,
                        slot: {
                            start_time: 1,
                            end_time: 1,
                        },
                        doctor: {
                            _id: 1,
                            fullName: 1,
                            specialization: 1,
                            experience: 1,
                            profileImage: 1,
                            clinicAddress: 1,
                        },
                        service: {
                            name: 1,
                            mode: 1,
                            fee: 1,
                            description: 1,
                        },
                        prescription: {
                            $cond: [
                                { $gt: [{ $size: "$prescription" }, 0] },
                                {
                                    _id: { $arrayElemAt: ["$prescription._id", 0] },
                                    fileUrl: { $arrayElemAt: ["$prescription.fileUrl", 0] },
                                    diagnosis: { $arrayElemAt: ["$prescription.diagnosis", 0] },
                                },
                                null,
                            ],
                        },
                    },
                },
            ];

            const results =
                await ConsultationAppointmentModal.aggregate<AppointmentDetailDTO>(
                    pipeline
                );

            

            return results.length > 0 ? results[0] : null;
        } catch (error) {
            if(error instanceof CustomError){
                throw error
            }else{

                throw new CustomError("appointemen fetching error",StatusCode.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async findByIdAndPatient(
        appointmentId: Types.ObjectId,
        patientId: Types.ObjectId
    ): Promise<IConsultationAppointment | null> {
        return await ConsultationAppointmentModal.findOne({
            _id: appointmentId,
            patientId: patientId,
        });
    }
    async updateAppointmentCancellation(
        appointmentId: Types.ObjectId,
        updateData: Partial<IConsultationAppointment>
    ): Promise<IConsultationAppointment | null> {
        return await ConsultationAppointmentModal.findByIdAndUpdate(
            appointmentId,
            { $set: updateData },
            { new: true }
        );
    }

    async findAppointmentsForDoctor(
        doctorId: Types.ObjectId,
        filters: {
            date?: string;
            mode?: string;
            status?: string;
            page?: number;
            limit?: number;
        }
    ): Promise<PaginatedAppointmentListDTO> {
        try {
            const matchStage: any = {
                doctorId: doctorId,
            };

            const today = new Date();

            switch (filters.date) {
                case "today":
                    matchStage.appointmentDate = {
                        $gte: startOfDay(today),
                        $lte: endOfDay(today),
                    };

                    break;
                case "tomorrow":{
                    const tomorrow = addDays(today, 1);
                    matchStage.appointmentDate = {
                        $gte: startOfDay(tomorrow),
                        $lte: endOfDay(tomorrow),
                    };
                    break;
                }
                case "upcoming":
                    matchStage.appointmentDate = {
                        $gt: endOfDay(today),
                    };
                    break;
                
                case "past":
                    matchStage.appointmentDate = {
                        $lt: startOfDay(today),
                    };
                    break;
                default:
                    break;
            }

            if (filters.status && filters.status !== "all") {
                matchStage.status = filters.status;
            }

            if (filters.mode && filters.mode !== "all") {
                let normalizedMode = filters.mode.toLowerCase();

                // Capitalize each word (handles "in-person", "online", etc.)
                normalizedMode = normalizedMode  // eslint-disable-line @typescript-eslint/no-unused-vars
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join("-");
            }

            const page = filters.page && filters.page > 0 ? filters.page : 1;
            const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
            const skip = (page - 1) * limit;

            const basePipeline: PipelineStage[] = [
                { $match: matchStage },

                //Join DoctorSchedules to get slot info
                {
                    $lookup: {
                        from: "doctorschedules",
                        localField: "doctorScheduleId",
                        foreignField: "_id",
                        as: "schedule",
                    },
                },
                { $unwind: "$schedule" },

                //Extract the specific slot by slotId

                {
                    $addFields: {
                        slot: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$schedule.availability",
                                        as: "slot",
                                        cond: {
                                            $eq: ["$$slot.slot_id", "$slotId"],
                                        },
                                    },
                                },
                                0,
                            ],
                        },
                    },
                },

                // join service

                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                { $unwind: "$service" },

                ...(filters.mode && filters.mode !== "all"
                    ? [
                        {
                            $match: {
                                "service.mode": filters.mode
                                    .toLowerCase()
                                    .split("-")
                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join("-"),
                            },
                        },
                    ]
                    : []),

                {
                    $lookup: {
                        from: "users",
                        localField: "patientId",
                        foreignField: "_id",
                        as: "patient",
                    },
                },
                { $unwind: "$patient" },

                {
                    $project: {
                        _id: 1,
                        appointmentDate: 1,
                        status: 1,
                        paymentStatus: 1,
                        slot: {
                            start_time: 1,
                            end_time: 1,
                        },
                        patient: {
                            _id: 1,
                            fullName: 1,
                            gender: 1,
                            profileUrl: 1,
                        },
                        service: {
                            name: 1,
                            mode: 1,
                        },
                    },
                },

                {
                    $sort: {
                        appointmentDate: 1,
                        "slot.start_time": 1,
                    },
                },
            ];

            const total = await ConsultationAppointmentModal.countDocuments(
                matchStage
            );

            const paginatedPipeline = [
                ...basePipeline,
                { $skip: skip },
                { $limit: limit },
            ];

            const results = await ConsultationAppointmentModal.aggregate(
                paginatedPipeline
            );

            return {
                data: results,
                pagination: {
                    page,
                    limit,
                    total,
                },
            };
        } catch (error) {
            console.error("Error fetching doctor appointments:", error);
            throw new CustomError(
                "Failed to retrieve appointments",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findAppointmentDetailForDoctor(
        appointmentId: Types.ObjectId,
        doctorId: Types.ObjectId
    ): Promise<DoctorAppointmentDetailDTO | null> {
        try {
            const pipeline: PipelineStage[] = [
                {
                    $match: {
                        _id: appointmentId,
                        doctorId: doctorId,
                    },
                },
                // Join Doctor Schedule for slot info
                {
                    $lookup: {
                        from: "doctorschedules",
                        localField: "doctorScheduleId",
                        foreignField: "_id",
                        as: "schedule",
                    },
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
                                        cond: { $eq: ["$$slot.slot_id", "$slotId"] },
                                    },
                                },
                                0,
                            ],
                        },
                    },
                },

                // Join Service
                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                { $unwind: "$service" },

                // Join Patient (User)
                {
                    $lookup: {
                        from: "users",
                        localField: "patientId",
                        foreignField: "_id",
                        as: "patient",
                    },
                },
                { $unwind: "$patient" },

                // Join Prescription (optional)
                {
                    $lookup: {
                        from: "prescriptions",
                        localField: "prescriptionId",
                        foreignField: "_id",
                        as: "prescription",
                    },
                },

                // Project fields
                {
                    $project: {
                        _id: 1,
                        appointmentDate: 1,
                        status: 1,
                        paymentStatus: 1,
                        slot: {
                            start_time: 1,
                            end_time: 1,
                        },
                        service: {
                            name: 1,
                            mode: 1,
                            fee: 1,
                            description: 1,
                        },
                        patient: {
                            _id: 1,
                            fullName: 1,
                            gender: 1,
                            mobile: 1,
                            address: 1,
                            profileUrl: 1,
                            personalInfo: 1,
                        },
                        prescription: {
                            $cond: [
                                { $gt: [{ $size: "$prescription" }, 0] },
                                {
                                    _id: { $arrayElemAt: ["$prescription._id", 0] },
                                    fileUrl: { $arrayElemAt: ["$prescription.fileUrl", 0] },
                                    diagnosis: { $arrayElemAt: ["$prescription.diagnosis", 0] },
                                },
                                null,
                            ],
                        },
                    },
                },
            ];

            const result =
                await ConsultationAppointmentModal.aggregate<DoctorAppointmentDetailDTO>(
                    pipeline
                );

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error(" Error fetching appointment detail:", error);
            throw new CustomError(
                "Failed to fetch appointment detail",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAppointmentFee(appointmentId: string): Promise<bookingFeeDTO> {
        try {
            const bookingFee = await ConsultationAppointmentModal.findById(
                appointmentId
            ).populate({
                path: "serviceId",
                select: "fee",
            });

            if (!bookingFee || !bookingFee.serviceId) {
                throw new CustomError("Booking fetching error", StatusCode.BAD_REQUEST);
            }

            const fee = (bookingFee.serviceId as any).fee; // Use `as any` if TS doesn't infer populated type

            return { fee };
        } catch (error) {
            console.error("Error fetching appointment fee:", error);
            throw new CustomError(
                "Internal Server Error",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}

export default ConsultationBookingRepository;
