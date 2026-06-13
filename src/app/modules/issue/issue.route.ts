
import { Router } from "express";
import { issueController } from "./issue.controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";




const router = Router()

router.post("/",verifyToken, issueController.issueCreated)


export const issueRoutes = router