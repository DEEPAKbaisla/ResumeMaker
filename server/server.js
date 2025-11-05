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
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173", // your Vite frontend URL
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ crucial
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

connectDB();
app.get("/", (req, res) => res.send("server is running .."));
app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/ai", aiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on  PORT : ${PORT}`);
});
