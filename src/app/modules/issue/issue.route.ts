
import { Router } from "express";
import { issueController } from "./issue.controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import canUpdateIssue from "../../middleware/canUpdateIssue.js";




const router = Router()

router.post("/", verifyToken, issueController.issueCreated)
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);
router.patch("/:id", verifyToken, canUpdateIssue, issueController.updateIssue);

export const issueRoutes = router