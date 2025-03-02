import { Request,Response } from "express";

interface IAdminController{
    login(req:Request,res:Response):Promise<void>
}

export default IAdminController