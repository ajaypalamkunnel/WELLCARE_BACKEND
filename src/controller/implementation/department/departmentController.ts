import { Request, Response } from "express";
import { IDepartmentController } from "../../interfaces/department/IDepartmentController";
import { IDepartmentService } from "../../../services/interfaces/department/iDepartmentService";
import { ERROR_MESSAGES, StatusCode } from "../../../constants/statusCode";
import { handleErrorResponse } from "../../../utils/errorHandler";
import { generateSuccessResponse } from "../../../utils/response";
import { handleControllerError } from "../../../utils/controllerErrorHandler";

class DepartmentController implements IDepartmentController {
    private _departmentService: IDepartmentService;

    constructor(departmentService: IDepartmentService) {
        this._departmentService = departmentService;
    }
    

    async createDepartment(req: Request, res: Response): Promise<void> {
        try {
            

            console.log(req.body);

            const { department } = await this._departmentService.createDeparment(
                req.body
            );

            res.status(StatusCode.CREATED).json({
                success: true,
                message: "Department created successfully",
                data: department,
            });
        } catch (error) {
            handleErrorResponse(res, error);
        }
    }

    
    async getAllDepatments(req: Request, res: Response): Promise<void> {
        try {
            const departments = await this._departmentService.getAllDepartments();

            res.status(StatusCode.OK).json({
                success: true,
                message: "Departments fetched successfully",
                data: departments,
            });
        } catch (error) {
            handleErrorResponse(res, error);
        }
    }

    async updateDepartmentStatus(req: Request, res: Response): Promise<void> {
        try {
            const { deptId, status } = req.body;

            if (!deptId || (!status && typeof status !== "boolean")) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid request",
                });

                return;
            }

            const department = await this._departmentService.updateDeptStatus(
                deptId,
                status
            );

            res.status(StatusCode.OK).json({
                success: true,
                message: "Department status updated successfully",
                data: department,
            });
        } catch (error) {
            console.error(
                `controller Error ${error instanceof Error ? error.message : error}`
            );

            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred",
            });
        }
    }

    async getAllActiveDepartments(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const allActiveDepartments =
                await this._departmentService.getAllActiveDepartments();

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "All active departments featched successfully",
                        allActiveDepartments
                    )
                );
        } catch (error: unknown) {
            return handleControllerError(res, error);
        }
    }

    async getAllPaginatedDepatments(req: Request, res: Response): Promise<void> {
        try {

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10

            console.log("hii");
            


            const departments = await this._departmentService.getAllPaginatedDepartments(page,limit)

            console.log("---",departments);
            

             res.status(StatusCode.OK)
              .json(generateSuccessResponse("All active departments featched successfully",departments))
            
        } catch (error) {

             res.status(StatusCode.INTERNAL_SERVER_ERROR).json(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
            
        }
    }
}

export default DepartmentController;
