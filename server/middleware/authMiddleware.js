import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  // console.log("=== AUTH MIDDLEWARE ===");
  // console.log("Authorization Header:", req.headers.authorization);

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("No Authorization header");
    return res.status(401).json({ message: "Unauthorized - Missing token" });
  }

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
    // console.log("JWT_SECRET:", process.env.JWT_SECRET);
    // console.log("Verification Error:", error.message);

    return res.status(401).json({
      message: "Unauthorized - Invalid token",
    });
  }
};
export default protect;
