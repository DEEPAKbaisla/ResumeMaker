import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Hashed password from registration (used for email verification)
    password: {
      type: String,
      required: false,
    },

    // Hashed OTP
    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    // Distinguish between email verification and password reset
    purpose: {
      type: String,
      enum: ["verify-email", "reset-password"],
      default: "verify-email",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete expired OTP documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient lookups by email + purpose
otpSchema.index({ email: 1, purpose: 1 });

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;