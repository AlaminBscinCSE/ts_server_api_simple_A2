import { Router } from "express";
import { authController } from "./auth.controller.js";


const router = Router()

router.post("/signup", authController.userRegistered)
router.post("/login",authController.userLogin)

export const authRoutes = router