import { threadId } from "worker_threads";
import { StatusCode } from "../../../constants/statusCode";
import ConsultationAppointmentModal, { IConsultationAppointment } from "../../../model/consultationBooking/consultationBooking";
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
import { bookingFeeDTO, Reason } from "../../../types/bookingTypes";


class PrescriptionService implements IPrescriptionService {

    private _prescriptionRepo: IPrescriptionRepository
    private _doctorWalletRepo: IDoctorWalletRepository
    private _consultationBookingRepo:IConsultationBookingRepository
    constructor(prescriptionRepo: IPrescriptionRepository,doctorWalletRepo: IDoctorWalletRepository,consultationBookingRepo:IConsultationBookingRepository) {

        this._prescriptionRepo = prescriptionRepo
        this._doctorWalletRepo = doctorWalletRepo
        this._consultationBookingRepo = consultationBookingRepo
    }
    async submitPrescription(data: Partial<IPrescription>): Promise<IPrescription> {

        try {
            console.log("==>", data.doctorId, data.patientId, data.appointmentId, data.medicines?.length);

            if (!data.doctorId || !data.patientId || !data.appointmentId || !data.medicines?.length) {
                throw new CustomError("Missing required fields.", StatusCode.BAD_REQUEST);
            }

            const savedPrescription = await this._prescriptionRepo.createPrescription(data)



            const pdfBuffer = await generatePrescriptionPDFBuffer(savedPrescription)


            const cloudinaryResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
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
                )
                streamifier.createReadStream(pdfBuffer).pipe(uploadStream)
            })

            console.log("urll===>",cloudinaryResult.secure_url);
            


            await this._prescriptionRepo.attachPrescriptionToAppointment(
                data.appointmentId.toString(),
                savedPrescription._id.toString(),
                cloudinaryResult.secure_url
            )




            const patient = await User.findById(data.patientId)

            const appointmentDetails:IConsultationAppointment = await this._consultationBookingRepo.getABookingDetails(data.appointmentId.toString())


            const appointmentFee = await this._consultationBookingRepo.getAppointmentFee(data.appointmentId.toString())

            //doctor wallet update

            
            await this._doctorWalletRepo.addTransaction(data.doctorId.toString(), appointmentFee.fee,"credit",Reason.AppoinTmentFee,data.appointmentId.toString(),"success",);





            if (patient?.email) {
                await sendPrescriptionEmail(patient.email, savedPrescription)
            }

            return savedPrescription

        } catch (error) {
            if (error instanceof CustomError) {
                throw new CustomError(error.message, error.statusCode)
            } else {
                throw new CustomError("Internal server error", StatusCode.INTERNAL_SERVER_ERROR)
            }
        }

    }


    async getPrescriptionByAppointment(appointmentId: string): Promise<IPrescription | null> {
        try {
            return await this._prescriptionRepo.findByAppointmentId(appointmentId);
        } catch (error) {
            throw error;
        }
    }

}

export default PrescriptionService