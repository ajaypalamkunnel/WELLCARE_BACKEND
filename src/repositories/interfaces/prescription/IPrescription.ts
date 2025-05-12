import { IPrescription } from "../../../model/prescription/prescription Modal";

interface IPrescriptionRepository {
    createPrescription(data: Partial<IPrescription>): Promise<IPrescription>;
    findByAppointmentId(appointmentId: string): Promise<IPrescription | null>;
    attachPrescriptionToAppointment(
        appointmentId: string,
        prescriptionId: string,
        prescriptionUrl: string
    ): Promise<void>;
}

export default IPrescriptionRepository;
