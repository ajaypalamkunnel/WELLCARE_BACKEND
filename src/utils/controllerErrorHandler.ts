import { Response } from "express"; 
import { CustomError } from "./CustomError";
import { generateErrorResponse } from "./response";


export const handleControllerError = (res: Response, error: unknown) => {

    const errorMessage = error instanceof CustomError ? error.message : "Internal Server Error";
    const statusCode = error instanceof CustomError ? error.statusCode : 500;


    console.error("Error:", error);

    return res.status(statusCode).json(generateErrorResponse(errorMessage,statusCode));
    

}