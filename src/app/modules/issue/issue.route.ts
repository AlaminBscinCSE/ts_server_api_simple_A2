
import { Router } from "express";
import { issueController } from "./issue.controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import canUpdateIssue from "../../middleware/canUpdateIssue.js";
import canDeleteIssue from "../../middleware/canDeleteIssue.js";




const router = Router()

router.post("/", verifyToken, issueController.issueCreated)
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);
router.patch("/:id", verifyToken, canUpdateIssue, issueController.updateIssue);
router.delete("/:id",verifyToken,canDeleteIssue,issueController.deleteIssue);

export const issueRoutes = router