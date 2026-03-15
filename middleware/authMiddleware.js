const jwtProvider = require("../utils/generateToken");
const User = require("../models/User");

/* ============================================================
   OPTIONAL AUTH (PUBLIC ROUTES ALLOWED)
============================================================ */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Allow public access if no token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const userId = jwtProvider.getUserIdFromToken(token);

    // 🔎 Fetch full user object
    const user = await User.findById(userId).select("-password");
    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;      // ✅ FIX: Attach user to request
    req.userId = userId; // optional legacy support
    next();

  } catch (error) {
    console.error("Token verification failed:", error.message);
    req.user = null;
    return next();
  }
};

/* ============================================================
   STRICT AUTH (BLOCKS UNAUTHENTICATED USERS)
============================================================ */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const userId = jwtProvider.getUserIdFromToken(token);

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;      // ✅ FIX
    req.userId = userId;
    next();

  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

/* ============================================================
   ROLE-BASED AUTHORIZATION
============================================================ */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied for this role",
      });
    }

    next();
  };
};




/* ============================================================
   EXPORTS
============================================================ */
module.exports = {
  authenticate,  // optional auth
  protect,       // strict auth
  authorize,     // role-based
};
