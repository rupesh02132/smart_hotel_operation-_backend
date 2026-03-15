const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  googleLogin,
  resendEmailOtp,
  assignRole, // ✅ NEW (Smart Hotel)
} = require("../controllers/authController");

const {
  getUserProfile,
  getAllUser,
  updateUserProfile,
  deleteUserController,
  getUserByEmail,
  getUserById,
   updateAvatar,
} = require("../controllers/userController");

const {
  authenticate,
  protect,
  authorize,
} = require("../middleware/authMiddleware");

/* ============================================================
   PUBLIC ROUTES
============================================================ */
router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google-login", googleLogin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-email-otp", resendEmailOtp);
router.put(
  "/avatar",
  protect,
  upload.single("avatar"),
  updateAvatar
);
/* ============================================================
   PROTECTED ROUTES (USER)
============================================================ */
router.get("/profile", protect, getUserProfile);
router.put("/updateProfile", protect, updateUserProfile);

/* ============================================================
   ADMIN ROUTES
============================================================ */
router.get("/users", protect, authorize("admin"), getAllUser);
router.delete("/:userId", protect, authorize("admin"), deleteUserController);
router.post("/assign-role", protect, authorize("admin"), assignRole);

/* ============================================================
   STAFF / MANAGER ROUTES
============================================================ */
router.get("/users/email/:email", protect, authorize("admin", "manager"), getUserByEmail);
router.get("/users/:userId", protect, authorize("admin", "manager"), getUserById);

/* ============================================================
   EXPORT
============================================================ */
module.exports = router;
