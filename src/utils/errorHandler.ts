import { Response } from "express";
import {StatusCode} from "../constants/statusCode"; // Assuming you have a status codes file

/**
 * Handles errors and sends a consistent error response.
 * @param res Express response object
 * @param error The error object
 * @param defaultStatusCode Default status code if error doesn't have one
 */

export const handleErrorResponse = (res: Response, error: unknown, defaultStatusCode = StatusCode.BAD_REQUEST) => {
    // console.error("Error:", error);

    // Check if error is an instance of Error and has a message
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

    return res.status(defaultStatusCode).json({
        success: false,
        message: errorMessage
    });
};
