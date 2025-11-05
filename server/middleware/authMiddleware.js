// import jwt from "jsonwebtoken";
// const protect = async (req, res, next) => {
//   const token = req.headers.authorization;
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
// };
// export default protect;

// gpt code

// import jwt from "jsonwebtoken";

// const protect = (req, res, next) => {
//   console.log("\n=== AUTH MIDDLEWARE ===");
//   console.log("Full Headers:", req.headers);

//   const authHeader = req.headers.authorization;
//   console.log("Authorization Header:", authHeader);

//   if (!authHeader) {
//     return res
//       .status(401)
//       .json({ message: "Unauthorized - Missing Authorization header" });
//   }

//   const token = authHeader.split(" ")[1];
//   console.log("Extracted Token:", token);

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("Decoded Token:", decoded);

//     req.userId = decoded.id;
//     console.log("✅ Middleware success, userId:", req.userId);
//     next();
//   } catch (error) {
//     console.log("❌ Token verification failed:", error.message);
//     res.status(401).json({ message: "Unauthorized - Invalid token" });
//   }
// };

// export default protect;

import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  // console.log("\n=== AUTH MIDDLEWARE ===");
  // console.log("Authorization Header:", req.headers.authorization);

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized - Missing token" });
  }

  // Handle both "Bearer <token>" and "<token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  // console.log("Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Token:", decoded);

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export default protect;

