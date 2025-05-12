import { StatusCode } from "../../../constants/statusCode";
import IDoctorRepository from "../../../repositories/interfaces/doctor/IDoctor";
import IDoctorServiceRepository from "../../../repositories/interfaces/doctorService/IDoctorServiceRepository";
import { CustomError } from "../../../utils/CustomError";
import { IDoctorService } from "../../../model/doctorService/doctorServicesModal";
import { IDoctorServiceService } from "../../interfaces/doctorServiceService/IDoctorServiceService";
import IDoctorSubscriptionsRepository from "../../../repositories/interfaces/doctorSubscriptions/IDoctorSubscriptions";
import { threadId } from "worker_threads";

class DoctorServiceService implements IDoctorServiceService {
    private _doctorServiceRepository: IDoctorServiceRepository;
    private _doctorRepository: IDoctorRepository;
    private _doctorSubscriptionRepository: IDoctorSubscriptionsRepository;
    constructor(
        doctorServiceRepository: IDoctorServiceRepository,
        doctorRepository: IDoctorRepository,
        doctorSubscriptionRepository: IDoctorSubscriptionsRepository
    ) {
        this._doctorServiceRepository = doctorServiceRepository;
        this._doctorRepository = doctorRepository;
        this._doctorSubscriptionRepository = doctorSubscriptionRepository;
    }

    async createService(data: IDoctorService): Promise<IDoctorService> {
        try {
            console.log("hi createService");

            const { name, mode, fee, description, doctorId } = data;

            const doctor = await this._doctorRepository.findById(doctorId.toString());
            console.log(doctor);

            if (!doctor) {
                throw new CustomError("Doctor not found", StatusCode.NOT_FOUND);
            }

            if (!doctor.isSubscribed || !doctor.currentSubscriptionId) {
                throw new CustomError(
                    "Doctor is not subscribed to a plan",
                    StatusCode.FORBIDDEN
                );
            }

            const totalServices =
                await this._doctorServiceRepository.countDoctorServices(
                    doctorId.toString()
                );

            const subscription =
                await this._doctorSubscriptionRepository.findActiveSubscription(
                    doctorId.toString()
                );

            const serviceLimit =
                subscription?.planId && "serviceLimit" in subscription.planId
                    ? subscription.planId.serviceLimit
                    : 0;

            if (totalServices >= serviceLimit) {
                throw new CustomError("Service limit exceeded", StatusCode.FORBIDDEN);
            }

            const serviceData = {
                ...data,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            return await this._doctorServiceRepository.create(serviceData);
        } catch (error) {
            console.error("Error in createService serive  payment:", error);

            if (error instanceof CustomError) {
                throw error;
            }

            throw new CustomError(
                "Internal Server error",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getServicesByDoctor(doctorId: string): Promise<IDoctorService[]> {
        try {
            const doctor = await this._doctorRepository.findById(doctorId);

            if (!doctor) {
                throw new CustomError("Doctor not found", StatusCode.NOT_FOUND);
            }

            const services =
                await this._doctorServiceRepository.findAllServiceByDoctorId(doctorId);

            // if(!services.length){
            //     throw new CustomError("No services found for this doctor",StatusCode.NOT_FOUND)
            // }

            return services;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }

            throw new CustomError(
                "Internal server Error",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async updateDoctorService(
        serviceId: string,
        doctorId: string,
        updateData: Partial<IDoctorService>
    ): Promise<IDoctorService> {
        try {
            const doctor = await this._doctorRepository.findById(doctorId);

            if (!doctor) {
                throw new CustomError("Doctor not Found", StatusCode.NOT_FOUND);
            }

            console.log(">>>--->", serviceId);
            const service = await this._doctorServiceRepository.findById(serviceId);

            if (!service) {
                throw new CustomError("Service not Found", StatusCode.NOT_FOUND);
            }

            if (service.doctorId.toString() !== doctorId) {
                throw new CustomError(
                    "Unauthorized to update this service",
                    StatusCode.UNAUTHORIZED
                );
            }

            const updatedService = await this._doctorServiceRepository.updateService(
                serviceId,
                updateData
            );

            if (!updatedService) {
                throw new CustomError(
                    "Failed to update doctor service",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
            return updatedService;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }

            throw new CustomError(
                "Internal server error",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}

export default DoctorServiceService;
