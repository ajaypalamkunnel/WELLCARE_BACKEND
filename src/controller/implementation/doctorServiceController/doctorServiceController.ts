import { Request, Response } from "express";
import { IDoctorServiceController } from "../../interfaces/doctorServiceController/IDoctorServiceController";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import { IDoctorServiceService } from "../../../services/interfaces/doctorServiceService/IDoctorServiceService";
import {
    generateErrorResponse,
    generateSuccessResponse,
} from "../../../utils/response";


class DoctorServiceController implements IDoctorServiceController {
    private _doctorServiceService: IDoctorServiceService;

    constructor(doctorServiceService: IDoctorServiceService) {
        this._doctorServiceService = doctorServiceService;
    }

    async createDoctorService(req: Request, res: Response): Promise<Response> {
        try {
            const { name, mode, fee, description, doctorId } = req.body;

            if (!name || !mode || !fee || !description || !doctorId) {
                throw new CustomError(
                    "All fields are required",
                    StatusCode.BAD_REQUEST
                );
            }

            const service = await this._doctorServiceService.createService(req.body);

            return res
                .status(StatusCode.CREATED)
                .json(
                    generateSuccessResponse("New Service created successfully", service)
                );
        } catch (error) {
            console.error("Error while creating service", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server Error"
                    )
                );
        }
    }

    async getDoctorServices(req: Request, res: Response): Promise<Response> {
        try {
            const { doctorId } = req.query;

            if (!doctorId) {
                return res
                    .status(StatusCode.UNAUTHORIZED)
                    .json({ error: "Unauthorized" });
            }

            const services = await this._doctorServiceService.getServicesByDoctor(
                doctorId as string
            );
         

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Doctor services fetched successfully",
                        services
                    )
                );
        } catch (error) {
            console.error("Error while fetching doctor services", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server Error"
                    )
                );
        }
    }

    async doctorServiceUpdate(req: Request, res: Response): Promise<Response> {
        try {
            const updateData = req.body;


            if (!updateData.doctorId) {
                return res
                    .status(StatusCode.UNAUTHORIZED)
                    .json({ error: "Unauthorized" });
            }

            const updatedService =
                await this._doctorServiceService.updateDoctorService(
                    updateData._id,
                    updateData.doctorId,
                    updateData
                );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse("Doctor service updated", updatedService)
                );
        } catch (error) {
            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : "Internal server Error"
                    )
                );
        }
    }
}

export default DoctorServiceController;
