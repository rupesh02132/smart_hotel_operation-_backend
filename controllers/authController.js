const userService = require("../service/userService");
const jwtProvider = require("../utils/generateToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    // 🔐 Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP + expiry
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP via email
    await sendEmail({
      to: user.email,
      subject: "Email Verification OTP",
      text: `Your email verification OTP is: ${otp}\nThis OTP is valid for 10 minutes.`,
    });

    return res.status(201).send({
      message: "Registered successfully. OTP sent to email.",
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/* ============================================================
   VERIFY EMAIL OTP
============================================================ */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).send({ message: "Email and OTP required" });
    }

    const user = await userService.getUserByEmail(email);
    if (!user) return res.status(404).send({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).send({ message: "User already verified" });
    }

    if (!user.otp || !user.otpExpire) {
      return res.status(400).send({ message: "OTP not generated" });
    }

    if (user.otp !== Number(otp)) {
      return res.status(400).send({ message: "Invalid OTP" });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).send({ message: "OTP expired" });
    }

    // ✅ VERIFY USER
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    return res.status(200).send({
      message: "Account verified successfully. Please login.",
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/* ============================================================
   LOGIN USER
============================================================ */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userService.getUserByEmailWithPassword(email);
    if (!user) return res.status(404).send({ message: "User not found" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res.status(401).send({ message: "Invalid credentials" });


    if (!user.isVerified)
      return res.status(403).send({ message: "Please verify your email first" });

    // 📊 Track last login (analytics)
    user.lastLogin = new Date();
    await user.save();

    const token = jwtProvider.generateToken(user._id);

    return res.status(200).json({
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
      },
      jwt: token,
      message: "Login successful",
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/* ============================================================
   RESEND EMAIL OTP
============================================================ */
const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send({ message: "Email is required" });

    const user = await userService.getUserByEmail(email);
    if (!user) return res.status(404).send({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).send({ message: "Email already verified" });

    // ⏳ OTP cooldown (2 min)
    if (user.otpExpire && user.otpExpire > Date.now() - 2 * 60 * 1000) {
      return res
        .status(429)
        .send({ message: "Please wait before requesting a new OTP" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Resend Email Verification OTP",
      text: `Your new email verification OTP is: ${otp}\nValid for 5 minutes.`,
    });

    return res.status(200).send({ message: "OTP resent successfully" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/* ============================================================
   FORGOT PASSWORD
============================================================ */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userService.getUserByEmailWithPassword(email);
    if (!user) return res.status(404).send({ message: "User not found" });

    const resetToken = jwtProvider.generateToken(user._id);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Password",
      text: `Click this link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 15 minutes.`,
    });

    return res.status(200).send({ message: "Reset link sent to your email" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/* ============================================================
   RESET PASSWORD
============================================================ */
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.params.token;

    const decoded = jwtProvider.getUserIdFromToken(token);
    const user = await userService.findUserById(decoded);

    if (
      !user ||
      user.resetPasswordToken !== token ||
      user.resetPasswordExpire < Date.now()
    ) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).send({ message: "Password reset successful" });
  } catch (err) {
    return res.status(400).send({ message: "Invalid or expired token" });
  }
};

/* ============================================================
   PHONE OTP (DEV MODE)
============================================================ */
const sendOtp = async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const user = await userService.getUserByEmail(req.body.email);

    if (!user) return res.status(404).send({ message: "User not found" });

    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log("OTP FOR TESTING:", otp, "Phone:", user.phone);

    return res.status(200).send({
      message: "OTP generated (check backend console)",
      otp,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/* ============================================================
   GOOGLE LOGIN
============================================================ */
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    if (!email)
      return res.status(400).json({ message: "Google authentication failed" });

    let user = await User.findOne({ email });

    if (!user) {
      const hashed = await bcrypt.hash("google-auth", 10);
      user = await User.create({
        firstname: given_name,
        lastname: family_name,
        email,
        password: hashed,
        isVerified: true,
        role: "user",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const authToken = jwtProvider.generateToken(user._id);

    return res.status(200).json({
      user,
      jwt: authToken,
      message: "Google login successful",
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    return res.status(400).json({ message: "Google authentication failed" });
  }
};

/* ============================================================
   ASSIGN ROLE (ADMIN ONLY)
============================================================ */
const assignRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!["user", "host", "admin", "staff", "manager"].includes(role)) {
      return res.status(400).send({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found" });

    user.role = role;
    await user.save();

    return res.status(200).send({ message: "Role updated", user });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/* ============================================================
   LOGOUT
============================================================ */
const logout = async (req, res) => {
  try {
    res.cookie("jwtProvider", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).send({ message: "Logout successful" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

/* ============================================================
   EXPORTS
============================================================ */
module.exports = {
  register,
  verifyOtp,
  resendEmailOtp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendOtp,
  googleLogin,
  assignRole,
};
