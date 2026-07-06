import express from "express";
import {
  enchanceJobDescription,
  enchanceSummary,
  uploadResume,
} from "../Controller/aiController.js";
import protect from "../middleware/authMiddleware.js";

const aiRouter = express.Router();

aiRouter.post("/enhance-pro-sum", protect, enchanceSummary);
aiRouter.post("/enhance-job-desc", protect, enchanceJobDescription);
aiRouter.post("/upload-resume", protect, uploadResume);

export default aiRouter;
