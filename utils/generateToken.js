const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();


// Use environment variable or fallback value
const SECRET_KEY = process.env.SECRET_KEY || "rupeshkumar";

// Generate Access Token (Short-lived)
const generateToken = (userId) => {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "7d" }); 
};

// Verify Access Token and Extract User ID
const getUserIdFromToken = (token) => {
    try {
        const decodedToken = jwt.verify(token, SECRET_KEY);
        return decodedToken.userId;
    } catch (error) {
        console.error("Token verification failed:", error.message);
        throw new Error(error.message.includes("expired") ? "Token expired" : "Invalid token");
    }
};

module.exports = { generateToken, getUserIdFromToken };







