import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import interviewRouter from "./routes/interviewRoutes.js";

import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 4444;

// Trust first proxy (useful if deployed behind a reverse proxy like Vercel, Heroku, etc.)
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://resumebuilder-silk-theta.vercel.app"] // your deployed frontend
    : ["http://localhost:5173"]; // your local frontend

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // if you’re using cookies/auth
  }),
);
connectDB();

// General rate limiter for all API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for resource creation and AI-based endpoints
const creationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per windowMs
  message: { message: "Too many resource creation/AI requests, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req, res) => res.send("server is running .."));

// Apply general API rate limiting to all /api routes
app.use("/api", apiLimiter);

// Specific stricter limiters for creation/AI endpoints
app.post("/api/resumes/create", creationLimiter);
app.post("/api/interview", creationLimiter);
app.post("/api/interview/resume/pdf/:interviewReportId", creationLimiter);
app.use("/api/ai", creationLimiter);

app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/ai", aiRouter);
app.use("/api/interview", interviewRouter);

app.listen(PORT, () => {
  console.log(`Server is running on  PORT : ${PORT}`);
});
