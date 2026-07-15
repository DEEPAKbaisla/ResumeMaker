import express from "express";
import upload from "../middleware/file.middleware.js";
import { authUser } from "../middleware/authMiddleware.js";
import {
  generateInterviewReportController,
  generateResumePdfController,
  getAllInterviewReportscontroller,
  getInterviewReportById,
  deleteInterviewReportController,
} from "../Controller/interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.post(
  "/",
  authUser,
  upload.single("resume"),
  generateInterviewReportController,
);

interviewRouter.get("/report/:interviewId", authUser, getInterviewReportById);

interviewRouter.delete("/report/:interviewId", authUser, deleteInterviewReportController);

interviewRouter.get("/", authUser, getAllInterviewReportscontroller);

interviewRouter.post(
  "/resume/pdf/:interviewReportId",
  authUser,
  generateResumePdfController,
);

export default interviewRouter;
