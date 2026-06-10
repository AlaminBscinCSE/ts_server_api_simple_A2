import type { Request, Response } from "express"
import { authService } from "./auth.service.js"
import { sendResponse } from "../../utils/sendResponse.js"
import { sendError } from "../../utils/sendError.js"


const userRegistered = async (req: Request, res: Response) => {
    try {
        const result = await authService.userRegistered(req.body)

        return sendResponse(
            res,
            201,
            "User registered successfully",
            result
        )

    } catch (error) {
        sendError(
            res,
            400,
            error instanceof Error ? error.message : "something went wrong",
            error
        )
    }
}

export const authController = {
    userRegistered,
}