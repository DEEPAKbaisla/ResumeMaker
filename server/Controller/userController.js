import Resume from "../model/Resume.js";
import User from "../model/User.js";
import jwt from "jsonwebtoken";

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
    const token = generateToken(newUser._id);
    newUser.password = undefined;
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Ivalid email or password" });
    }
    if (!user.comparePassword(password)) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    //   agr match krta h to token generate krdo
    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({ message: "Login successful", token, user });
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
