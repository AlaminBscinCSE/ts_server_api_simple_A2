

import type { NextFunction, Request, Response } from "express"
import { pool } from "../db/db.js"
import { sendError } from "../utils/sendError.js"


const canDeleteIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        if (!user) {
            return sendError(
                res,
                401,
                "Unauthorized",
                null
            );

        }
        if (user.role !== "maintainer") {
            return sendError(
                res,
                403,
                "Only maintainers can delete issues",
                null
            );
        }

        next();
    } catch (error) {
        return sendError(
            res,
            500,
            "Internal server error",
            error
        );
    }
}

export default canDeleteIssue