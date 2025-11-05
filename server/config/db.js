import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("please provide mongodb uri");
}
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected to db ");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

// export default connectDB;
