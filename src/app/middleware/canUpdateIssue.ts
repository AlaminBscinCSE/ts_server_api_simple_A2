import type { NextFunction, Request, Response } from "express"
import { pool } from "../db/db.js"
import { sendError } from "../utils/sendError.js"


const canUpdateIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const issueId = Number(req.params.id)
        const user = req.user
        const result = await pool.query(
            `SELECT * FROM issues WHERE id = $1`,
            [issueId]
        )
        const issue = result.rows[0]
        if (!issue) {
            return sendError(res, 404, "Issue not found", null);
        }
        if (user?.role == "maintainer") {
            return next()
        }

        if (user?.role === "contributor") {
            if (user?.id !== issue.reporter_id) {
                return sendError(
                    res,
                    403,
                    "You can only update your own issues",
                    null
                );
            }

            if (issue.status !== "open") {
                return sendError(
                    res,
                    409,
                    "You can only update open issues",
                    null
                );
            }
            return next()
        }
        return sendError(res, 403, "Forbidden", null);
    } catch (error) {
        return sendError(
            res,
            500,
            error instanceof Error ? error.message : "Server error",
            error
        );
    }
}

export default canUpdateIssue