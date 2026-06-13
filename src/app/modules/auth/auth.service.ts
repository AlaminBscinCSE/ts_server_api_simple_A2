import jwt from "jsonwebtoken";
import { pool } from "../../db/db.js";
import type { IUser } from "./auth.interface.js";
import bcrypt from "bcrypt";
import { envConfig } from "../../config/env.js";

const userRegistered = async (payload: IUser) => {
    const { name, email, password, role } = payload;

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await pool.query(
        `
    INSERT INTO users (
      name,
      email,
      password,
      role
    )
    VALUES ($1, $2, $3,COALESCE($4, 'contributor')
    RETURNING*
    `,
        [name, email, hashedPassword, role]
    );

    delete result.rows[0].password

    return result.rows[0]
}


const userLogin = async (payload: {
    email: string,
    password: string
}) => {
    const { email, password } = payload
    const userData = await pool.query(
        `
        SELECT*FROM users WHERE email=$1
        `
        , [email]
    )
    if (userData.rows.length == 0) {
        throw new Error("Invalid credential")
    }
    const user = userData.rows[0]
    const matchPassword = await bcrypt.compare(password, user.password)

    if (!matchPassword) {
        throw new Error("Invalid credential")
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
    const token = jwt.sign(
        jwtPayload,
        envConfig.JWT_SECRET as string,
        {
            expiresIn: "1d"
        }
    );
    delete user.password
    return {
        token,
        user
    }

}


export const authService = {
    userRegistered,
    userLogin
}