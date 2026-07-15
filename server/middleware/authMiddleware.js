// import jwt from "jsonwebtoken";

// import tokenBlacklistModel from "../model/blacklist.model.js";

// export const protect = (req, res, next) => {
//   // console.log("=== AUTH MIDDLEWARE ===");
//   // console.log("Authorization Header:", req.headers.authorization);

//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     console.log("No Authorization header");
//     return res.status(401).json({ message: "Unauthorized - Missing token" });
//   }

//   const token = authHeader.startsWith("Bearer ")
//     ? authHeader.split(" ")[1]
//     : authHeader;

//   // console.log("Extracted Token:", token);

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // console.log("Decoded Token:", decoded);

//     req.userId = decoded.id;
//     next();
//   } catch (error) {
//     // console.log("JWT_SECRET:", process.env.JWT_SECRET);
//     // console.log("Verification Error:", error.message);

//     return res.status(401).json({
//       message: "Unauthorized - Invalid token",
//     });
//   }
// };
// // export default protect;

// // import jwt from 'jsonwebtoken'

// export const authUser = async (req, res, next) => {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(401).json({
//       message: "Token not provided",
//     });
//   }

//   const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });
//   if (isTokenBlacklisted) {
//     return res.status(401).json({
//       message: "Token is invalid ",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       message: "Invalid token.",
//     });
//   }
// };

// // export default { authUser, protect };


import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../model/blacklist.model.js";

export const authUser = async (req, res, next) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
  }

  if (!token) {
    return res.status(401).json({
      message: "Please login first",
    });
  }

  const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });

  if (isTokenBlacklisted) {
    return res.status(401).json({
      message: "Token is invalid",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    req.userId = decoded.id; // convenient for controllers

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
