import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";

const app = express();
const PORT = process.env.PORT || 4444;
app.use(express.json());
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
app.get("/", (req, res) => res.send("server is running .."));
app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/ai", aiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on  PORT : ${PORT}`);
});
