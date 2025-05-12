import mongoose from "mongoose";
import Services, {
    IDoctorService,
} from "../../../model/doctorService/doctorServicesModal";
import { BaseRepository } from "../../base/BaseRepository";
import IDoctorServiceRepository from "../../interfaces/doctorService/IDoctorServiceRepository";

class DoctorServiceRepository
    extends BaseRepository<IDoctorService>
    implements IDoctorServiceRepository {
    constructor() {
        super(Services);
    }

    createDoctorService(
        serviceData: Partial<IDoctorService>
    ): Promise<IDoctorService> {
        throw new Error("Method not implemented.");
    }
    async countDoctorServices(doctorId: string): Promise<number> {
        return await Services.countDocuments({ doctorId });
    }

    async findAllServiceByDoctorId(doctorId: string): Promise<IDoctorService[]> {
        try {
            return await Services.find({ doctorId }).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error("Failed to fetch doctor service");
        }
    }

    async updateService(
        serviceId: string,
        updateData: Partial<IDoctorService>
    ): Promise<IDoctorService | null> {
        try {
            return await Services.findByIdAndUpdate(
                new mongoose.Types.ObjectId(serviceId),
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error("Failed to update doctor service");
        }
    }
}

export default DoctorServiceRepository;
