
import dotenv from "dotenv";
import { getEnv } from "../utils/helper.js";


dotenv.config();

export const envConfig = {
  PORT: Number(process.env.PORT) || 3000,

  DB_CONNECTION: getEnv("DB_CONNECTION"),

  JWT_SECRET: getEnv("JWT_SECRET"),

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
} as const;