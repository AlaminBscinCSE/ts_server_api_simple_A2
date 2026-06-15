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
const getAllIssues = async (
    req: Request,
    res: Response
) => {
    try {
        const result = await issueService.getAllIssues(
            req.query
        );

        return sendResponse(
            res,
            200,
            "Issues retrieved successfully",
            result
        );
    } catch (error) {
        return sendError(
            res,
            500,
            error instanceof Error
                ? error.message
                : "Something went wrong",
            error
        );
    }
};

const getSingleIssue = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const result = await issueService.getSingleIssue(id);

        return sendResponse(
            res,
            200,
            "Issue retrieved successfully",
            result
        );
    } catch (error) {
        return sendError(
            res,
            500,
            error instanceof Error
                ? error.message
                : "Something went wrong",
            error
        );
    }
};



export const issueController = {
    issueCreated,
    getAllIssues,
    getSingleIssue
}