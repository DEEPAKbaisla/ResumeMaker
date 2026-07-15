import express from "express";
import {
  enchanceJobDescription,
  enchanceSummary,
  uploadResume,
} from "../Controller/aiController.js";
import { authUser} from "../middleware/authMiddleware.js";

const aiRouter = express.Router();

aiRouter.post("/enhance-pro-sum", authUser, enchanceSummary);
aiRouter.post("/enhance-job-desc", authUser, enchanceJobDescription);
aiRouter.post("/upload-resume", authUser, uploadResume);

export default aiRouter;
