import type {
    NextFunction,
    Request,
    Response
} from "express";

import jwt, { type JwtPayload } from "jsonwebtoken";


import { pool } from "../db/db.js";
import { sendError } from "../utils/sendError.js";
import { envConfig } from "../config/env.js";

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization;
      
        if (!token) {
            return sendError(
                res,
                401,
                "Unauthorized",
                "Token is required"
            );
        }
       
        const decoded = jwt.verify(
            token,
            envConfig.JWT_SECRET
        ) as JwtPayload;


        const userData = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE email = $1
            `,
            [decoded.email]
        );
      
        if (userData.rows.length === 0) {
            return sendError(
                res,
                404,
                "User not found",
                null
            );
        }

        req.user = decoded;

        next();
    } catch (error) {
        return sendError(
            res,
            401,
            "Invalid or expired token",
            error
        );
    }
};