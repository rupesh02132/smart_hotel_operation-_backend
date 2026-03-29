const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

router.get("/my", protect, getMyNotifications);
router.post("/", protect, createNotification);
router.put("/:id/read", protect, markNotificationRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;