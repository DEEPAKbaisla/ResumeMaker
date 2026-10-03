import express from "express";
import {
  forgotPassword,
  getMeController,
  getUserById,
  getUserResumes,
  loginUser,
  logoutUserController,
  registerUser,
  resendOtp,
  resetPassword,
  sendOtp,
  verifyOtp,
  verifyResetOtp,
} from "../Controller/userController.js";
import { authUser } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/data", authUser, getUserById);
userRouter.get("/resumes", authUser, getUserResumes);
userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/resend-otp", resendOtp);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-reset-otp", verifyResetOtp);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/me", authUser, getMeController);
userRouter.get("/logout", authUser, logoutUserController);

export default userRouter;
