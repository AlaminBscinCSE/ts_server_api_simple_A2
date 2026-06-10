import type { Response } from "express";

export const sendError = (
    res: Response,
    statusCode: number,
    message: string,
    errors: unknown

) => {
    const response = {
        success: false,
        message,
        errors,
    }
    return res.status(statusCode).json(response)
} 
