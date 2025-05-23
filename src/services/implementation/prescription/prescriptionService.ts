
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCode } from "../../../constants/statusCode";
import {
    IConsultationAppointment,
} from "../../../model/consultationBooking/consultationBooking";
import { IPrescription } from "../../../model/prescription/prescription Modal";
import { User } from "../../../model/user/userModel";
import IPrescriptionRepository from "../../../repositories/interfaces/prescription/IPrescription";
import { CustomError } from "../../../utils/CustomError";
import { sendPrescriptionEmail } from "../../../utils/emailUtils";
import cloudinary from "../../../utils/cloudinary";
import IPrescriptionService from "../../interfaces/prescription/IPrescriptionService";
import streamifier from "streamifier";
import { generatePrescriptionPDFBuffer } from "../../../utils/pdfGenerator";
import IDoctorWalletRepository from "../../../repositories/interfaces/doctorWallet/IDoctorWallet";
import IConsultationBookingRepository from "../../../repositories/interfaces/consultationBooking/IConsultationBookingRepository";
import { Reason } from "../../../types/bookingTypes";
import { sendNotificationToUser } from "../../../utils/notification/sendNotification";
import { io } from "../../..";

class PrescriptionService implements IPrescriptionService {
    private _prescriptionRepo: IPrescriptionRepository;
    private _doctorWalletRepo: IDoctorWalletRepository;
    private _consultationBookingRepo: IConsultationBookingRepository;
    constructor(
        prescriptionRepo: IPrescriptionRepository,
        doctorWalletRepo: IDoctorWalletRepository,
        consultationBookingRepo: IConsultationBookingRepository
    ) {
        this._prescriptionRepo = prescriptionRepo;
        this._doctorWalletRepo = doctorWalletRepo;
        this._consultationBookingRepo = consultationBookingRepo;
    }
    async submitPrescription(
        data: Partial<IPrescription>
    ): Promise<IPrescription> {
        try {

            if (
                !data.doctorId ||
                !data.patientId ||
                !data.appointmentId ||
                !data.medicines?.length
            ) {
                throw new CustomError(
                    "Missing required fields.",
                    StatusCode.BAD_REQUEST
                );
            }

            const savedPrescription = await this._prescriptionRepo.createPrescription(
                data
            );

            const pdfBuffer = await generatePrescriptionPDFBuffer(savedPrescription);

            const cloudinaryResult = await new Promise<{ secure_url: string }>(
                (resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: "raw",
                            folder: "prescriptions",
                            public_id: `prescription_${savedPrescription._id}`,
                            format: "pdf",
                        },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result as any);
                        }
                    );
                    streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
                }
            );



            await this._prescriptionRepo.attachPrescriptionToAppointment(
                data.appointmentId.toString(),
                savedPrescription._id.toString(),
                cloudinaryResult.secure_url
            );

            const patient = await User.findById(data.patientId);

            const appointmentDetails: IConsultationAppointment =
                await this._consultationBookingRepo.getABookingDetails(
                    data.appointmentId.toString()
                );

            const appointmentFee =
                await this._consultationBookingRepo.getAppointmentFee(
                    data.appointmentId.toString()
                );

            //doctor wallet update

            await this._doctorWalletRepo.addTransaction(
                data.doctorId.toString(),
                appointmentFee.fee,
                "credit",
                Reason.AppoinTmentFee,
                data.appointmentId.toString(),
                "success"
            );

            if (patient?.email) {
                await sendPrescriptionEmail(patient.email, savedPrescription);
            }

            sendNotificationToUser(
                io,
                appointmentDetails.patientId.toString(),
                "user",
                "Your resend Consultation prescription",
                "Your recent consultation prescription is now available. You can access it via your registered email or by visiting the Appointments section in your account."
            );

            return savedPrescription;
        } catch (error) {
            if (error instanceof CustomError) {
                throw new CustomError(error.message, error.statusCode);
            } else {
                throw new CustomError(
                    "Internal server error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async getPrescriptionByAppointment(
        appointmentId: string
    ): Promise<IPrescription | null> {

        return await this._prescriptionRepo.findByAppointmentId(appointmentId);

    }
}

export default PrescriptionService;
