import { Request, Response } from "express";
import { IDepartmentController } from "../../interfaces/department/IDepartmentController";
import { IDepartmentService } from "../../../services/interfaces/department/iDepartmentService";
import { StatusCode } from "../../../constants/statusCode";
import { handleErrorResponse } from "../../../utils/errorHandler";


class DepartmentController implements IDepartmentController{

    private _departmentService:IDepartmentService

    constructor(departmentService:IDepartmentService){
        this._departmentService = departmentService
    }
    async createDepartment(req: Request, res: Response): Promise<void> {
        try {
            console.log("create dept controller");
            
            console.log(req.body);
            
           const {department} = await this._departmentService.createDeparment(req.body)

           res.status(StatusCode.CREATED).json(
            {
            success:true,
            message:"Department created successfully",
            data:department
            })
        } catch (error) {
            handleErrorResponse(res,error)
        }

    }
    async getAllDepatments(req: Request, res: Response): Promise<void> {
        try {

            const departments = await this._departmentService.getAllDepartments()

             res.status(StatusCode.OK).json({
                success:true,
                message: "Departments fetched successfully",
                data: departments
            })
            
        } catch (error) {
            handleErrorResponse(res,error)
        }
    }

}

export default DepartmentController;