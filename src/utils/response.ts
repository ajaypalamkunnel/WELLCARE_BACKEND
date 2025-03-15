export const generateSuccessResponse = <T>(message: string, data?: T) => {
    return {
        success: true,
        message,
        ...(data !== undefined && { data }),
    };
};



export const generateErrorResponse = (message: string, status: number = 500) => {
    return {
        success: false,
        message,
        status
    };
};