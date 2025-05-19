import { IDoctorService } from "../../../model/doctorService/doctorServicesModal";
import { IBaseRepository } from "../../base/IBaseRepository";

export default interface IDoctorServiceRepository
    extends IBaseRepository<IDoctorService> {
    // createDoctorService(
    //     serviceData: Partial<IDoctorService>
    // ): Promise<IDoctorService>;
    countDoctorServices(doctorId: string): Promise<number>;
    findAllServiceByDoctorId(doctorId: string): Promise<IDoctorService[]>;
    updateService(
        serviceId: string,
        updateData: Partial<IDoctorService>
    ): Promise<IDoctorService | null>;
}
