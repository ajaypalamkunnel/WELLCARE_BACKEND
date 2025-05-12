import { IPrescription } from "../../../model/prescription/prescription Modal";

interface IPrescriptionService {
    submitPrescription(data: Partial<IPrescription>): Promise<IPrescription>;
    getPrescriptionByAppointment(
        appointmentId: string
    ): Promise<IPrescription | null>;
}

export default IPrescriptionService;
