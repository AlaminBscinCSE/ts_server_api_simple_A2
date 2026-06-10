import { pool } from "../../db/db.js";
import type { IUser } from "./auth.interface.js";
import bcrypt from "bcrypt";

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
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      name,
      email,
      role,
      created_at,
      updated_at
    `,
        [name, email, hashedPassword, role]
    );
    return result.rows[0]
}


export const authService = {
    userRegistered,
}