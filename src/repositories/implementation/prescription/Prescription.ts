import ConsultationAppointmentModal from "../../../model/consultationBooking/consultationBooking";
import Prescription, {
    IPrescription,
} from "../../../model/prescription/prescription Modal";
import { BaseRepository } from "../../base/BaseRepository";
import IPrescriptionRepository from "../../interfaces/prescription/IPrescription";

class PrescriptionRepository
    extends BaseRepository<IPrescription>
    implements IPrescriptionRepository {
    constructor() {
        super(Prescription);
    }
    async createPrescription(
        data: Partial<IPrescription>
    ): Promise<IPrescription> {
        try {
            const prescription = await Prescription.create(data);
            return prescription;
        } catch (error) {
            console.error('Failed to create prescription:', error);
            throw error;
        }
    }
    async findByAppointmentId(
        appointmentId: string
    ): Promise<IPrescription | null> {
        try {
            return await Prescription.findOne({ appoinmentId: appointmentId });
        } catch (error) {
            console.error('Failed to find appointment:', error);
            throw error;
        }
    }

    async attachPrescriptionToAppointment(
        appointmentId: string,
        prescriptionId: string,
        prescriptionUrl: string
    ): Promise<void> {
        try {
            await ConsultationAppointmentModal.findByIdAndUpdate(appointmentId, {
                prescriptionId,
                status: "completed",
                prescriptionUrl: prescriptionUrl,
            });
        } catch (error) {
            console.error("Failed to attach prescription:", error);
            throw new Error("Internal Server Error: Could not update appointment.");

        }
    }
}

export default PrescriptionRepository;
