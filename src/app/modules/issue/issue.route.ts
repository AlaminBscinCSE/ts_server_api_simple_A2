
import { Router } from "express";
import { issueController } from "./issue.controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";




const router = Router()

router.post("/", verifyToken, issueController.issueCreated)
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);

export const issueRoutes = router