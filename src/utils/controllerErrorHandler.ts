import { Response } from "express"; 
import { CustomError } from "./CustomError";
import { generateErrorResponse } from "./response";


export const handleControllerError = (res: Response, error: unknown) => {

    const errorMessage = error instanceof CustomError ? error.message : "Internal Server Error";
    const statusCode = error instanceof CustomError ? error.statusCode : 500;


    console.error("Error:", error);

    return res.status(statusCode).json(generateErrorResponse(errorMessage,statusCode));
    

}

export function fromISTToUTC(year: number, month: number, day: number, hour: number, minute: number): Date {
  const istDate = new Date(year, month, day, hour, minute);
  return new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000);
}