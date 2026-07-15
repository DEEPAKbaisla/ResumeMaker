import express from "express";
import { authUser } from "../middleware/authMiddleware.js";
import {
  createResume,
  deleteResume,
  getPublicResumeById,
  getResumeById,
  updateResume,
} from "../Controller/resumeController.js";
import upload from "../middleware/multer.js";

const resumeRouter = express.Router();

resumeRouter.post("/create", authUser, createResume);
resumeRouter.put("/update", upload.single("image"), authUser, updateResume);
resumeRouter.delete("/delete/:resumeId", authUser, deleteResume);
resumeRouter.get("/get/:resumeId", authUser, getResumeById);
resumeRouter.get("/public/:resumeId", getPublicResumeById);

export default resumeRouter;
