import { Request, Response } from "express";
import IPrescriptionController from "../../interfaces/prescription/IPrescriptionController";
import IPrescriptionService from "../../../services/interfaces/prescription/IPrescriptionService";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import {
    generateErrorResponse,
    generateSuccessResponse,
} from "../../../utils/response";

class PrescriptionController implements IPrescriptionController {
    private _prescriptionService: IPrescriptionService;

    constructor(prescriptionService: IPrescriptionService) {
        this._prescriptionService = prescriptionService;
    }
    async submitPrescription(req: Request, res: Response): Promise<Response> {
        try {
            console.log("prescription : ", req.body);

            const prescription = await this._prescriptionService.submitPrescription(
                req.body
            );

            if (!prescription) {
                throw new CustomError(
                    "Prescription creation failed",
                    StatusCode.BAD_REQUEST
                );
            }

            return res
                .status(StatusCode.ACCEPTED)
                .json(
                    generateSuccessResponse(
                        "Prescription added successfully",
                        prescription
                    )
                );
        } catch (error) {
            console.log("prescription subscription error : ", error);

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
                            : "Internal server error"
                    )
                );
        }
    }

    async getPrescription(req: Request, res: Response): Promise<Response> {
        try {
            const { appoinmentId } = req.params;

            const prescription =
                await this._prescriptionService.getPrescriptionByAppointment(
                    appoinmentId
                );

            if (!prescription) {
                throw new CustomError("Prescription not found", StatusCode.NOT_FOUND);
            }

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Prescription fetched successfully",
                        prescription
                    )
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
                            : "Unexpected error occurs"
                    )
                );
        }
    }
}

export default PrescriptionController;
