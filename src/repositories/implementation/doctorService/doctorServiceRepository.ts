import mongoose from "mongoose";
import Services, {
    IDoctorService,
} from "../../../model/doctorService/doctorServicesModal";
import { BaseRepository } from "../../base/BaseRepository";
import IDoctorServiceRepository from "../../interfaces/doctorService/IDoctorServiceRepository";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";

class DoctorServiceRepository
    extends BaseRepository<IDoctorService>
    implements IDoctorServiceRepository {
    constructor() {
        super(Services);
    }
    

    // createDoctorService(
    //     serviceData: Partial<IDoctorService>
    // ): Promise<IDoctorService> {
    //     throw new Error("Method not implemented.");
    // }
    async countDoctorServices(doctorId: string): Promise<number> {
        return await Services.countDocuments({ doctorId });
    }

    async findAllServiceByDoctorId(doctorId: string): Promise<IDoctorService[]> {
        try {
            return await Services.find({ doctorId }).sort({ createdAt: -1 });
        } catch (error) {
             console.error("Error fetching doctor services:", error);
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
            console.error("update service error : ",error)
            throw new Error("Failed to update doctor service");
        }
    }

    
   async isServiceAlreadyExist(doctorId: string, name: string, mode: "Online" | "In-Person" | "Both"): Promise<boolean> {
        try {
            
            const existing = await Services.findOne({
                doctorId,
                name:{$regex: new RegExp(`^${name}$`, 'i')},
                mode
            })

            return !!existing

        } catch (error) {
            
            console.error("error in alreday exisitign service checking");
            throw new CustomError("error in alreday exisitign service checking",StatusCode.INTERNAL_SERVER_ERROR)
            
        }
    }
}

export default DoctorServiceRepository;
