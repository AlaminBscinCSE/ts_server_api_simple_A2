import { Router } from "express";
import { authController } from "./auth.controller.js";


const router = Router()

router.post("/signup", authController.userRegistered)

export const authRoutes = router