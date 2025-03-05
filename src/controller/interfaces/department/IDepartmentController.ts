import { Request, Response } from "express";


export interface IDepartmentController{
    createDepartment(req:Request,res:Response):Promise<void>
    getAllDepatments(req:Request,res:Response):Promise<void>
}