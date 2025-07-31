import { IDoctorService } from "../../../model/doctorService/doctorServicesModal";
import { DoctorServiceDTO } from "../../doctorServicesDto/doctorService.dto";

export const mapDoctorServiceToDTO = (service: IDoctorService): DoctorServiceDTO => {
  return {
    _id: service._id.toString(),
    name: service.name,
    mode: service.mode,
    fee: service.fee,
    description: service.description,
    isActive: service.isActive,
    doctorId: service.doctorId.toString(),
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
};

export const mapDoctorServicesToDTO = (services: IDoctorService[]): DoctorServiceDTO[] => {
  return services.map(mapDoctorServiceToDTO);
};