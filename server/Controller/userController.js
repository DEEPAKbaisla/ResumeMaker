import Resume from "../model/Resume.js";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import Otp from "../model/Otp.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendEmail.js";
import { otpTemplate } from "../utils/templates/otpTemplate.js";
import { welcomeTemplate } from "../utils/templates/welcomeTemplate.js";
import tokenBlacklistModel from "../model/blacklist.model.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    //  pass hash check krio
    const newUser = await User.create({ name, email, password });

    // return succes mssg
    // const token = generateToken(newUser._id);
    // newUser.password = undefined;
    // res
    //   .status(201)
    //   .json({ message: "User registered successfully", user: newUser, token });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    // res.cookie("token",token)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(201).json({
      message: "User login successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be strong.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Remove previous OTP for this email
    await Otp.deleteMany({
      email: email.toLowerCase(),
    });

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save temporary registration
    await Otp.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send Email
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: otpTemplate(name, otp),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const otpData = await Otp.findOne({
      email: email.toLowerCase(),
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found.",
      });
    }

    // Expired
    if (otpData.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpData._id });

      return res.status(400).json({
        success: false,
        message: "OTP expired.",
      });
    }

    // Max attempts
    if (otpData.attempts >= 5) {
      await Otp.deleteOne({ _id: otpData._id });

      return res.status(400).json({
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    const isMatch = await bcrypt.compare(otp, otpData.otp);

    if (!isMatch) {
      otpData.attempts += 1;

      await otpData.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    const user = await User.create({
      name: otpData.name,
      email: otpData.email,
      password: otpData.password,
      isVerified: true,
    });

    await Otp.deleteOne({
      _id: otpData._id,
    });

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    await sendEmail({
      to: user.email,
      subject: "Welcome to Resume Builder 🎉",
      html: welcomeTemplate(user.name),
    });

    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: "Email verified successfully.",
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const otpData = await Otp.findOne({
      email: email.toLowerCase(),
    });

    if (!otpData) {
      return res.status(404).json({
        success: false,
        message: "Registration session not found. Please register again.",
      });
    }

    // Generate new OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Hash new OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update OTP document
    otpData.otp = hashedOtp;
    otpData.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    otpData.attempts = 0;

    await otpData.save();

    // Send email
    await sendEmail({
      to: otpData.email,
      subject: "Your New Verification OTP",
      html: otpTemplate(otpData.name, otp),
    });

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first.",
      });
    }

    if (!user.comparePassword(password)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //   agr match krta h to token generate krdo
    // const token = generateToken(user._id);
    // user.password = undefined;
    // console.log("Generated Token:", token);

    // res.status(200).json({ message: "Login successful", token, user });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    // res.cookie("token",token)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(201).json({
      message: "User login successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.userId;
    // check krna h user exist krta h ya nhi
    // console.log(userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // agr mil jata h to user data return krdo
    user.password = undefined;
    return res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get user resume details
export const getUserResumes = async (req, res) => {
  try {
    const userId = req.userId; //user id from auth middleware

    //return user resumes
    const resumes = await Resume.find({ userId });
    res.status(200).json({ resumes });
  } catch (error) {}
};

export const getMeController = async (req, res) => {
  const user = await userModel.findById(req.user.id);

  res.status(200).json({
    message: "User details fetched successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

export const logoutUserController = async (req, res) => {
  const token = req.cookies.token;

  if (token) {
    await tokenBlacklistModel.create({ token });
  }
  res.clearCookie("token");
  res.status(200).json({
    message: "User logged out successfully",
  });
};
