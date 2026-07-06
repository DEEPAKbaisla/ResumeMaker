import express from "express";
import {
  getUserById,
  getUserResumes,
  loginUser,
  registerUser,
  resendOtp,
  sendOtp,
  verifyOtp,
} from "../Controller/userController.js";
import protect from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/data",protect, getUserById);
userRouter.get("/resumes",protect, getUserResumes);
userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/resend-otp", resendOtp);


export default userRouter