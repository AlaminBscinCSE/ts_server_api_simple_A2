import type { Request, Response } from "express"
import { sendResponse } from "../../utils/sendResponse.js"
import { sendError } from "../../utils/sendError.js"
import { issueService } from "./issue.service.js"



const issueCreated = async (req: Request, res: Response) => {
    try {
        const reporter_id = req.user!.id as number
        const result = await issueService.issueCreated(req.body, reporter_id)

        return sendResponse(
            res,
            201,
            "Issue created successfully",
            result
        )

    } catch (error) {
        sendError(
            res,
            500,
            error instanceof Error ? error.message : "something went wrong",
            error
        )
    }
}





export const issueController = {
    issueCreated
}