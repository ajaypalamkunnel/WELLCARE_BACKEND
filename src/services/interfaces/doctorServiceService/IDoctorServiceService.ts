import { IDoctorService } from "../../../model/doctorService/doctorServicesModal";

export interface IDoctorServiceService {
    createService(data: IDoctorService): Promise<IDoctorService>;
    getServicesByDoctor(doctorId: string): Promise<IDoctorService[]>;
    updateDoctorService(
        serviceId: string,
        doctorId: string,
        updateData: Partial<IDoctorService>
    ): Promise<IDoctorService>;
}
