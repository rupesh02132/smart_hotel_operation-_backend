const Notification = require("../models/Notification");
const { getIO } = require("../utils/socket"); 

const createNotification = async (req, res) => {
  try {
    const { user, title, message, type, link, broadcast } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message required" });
    }

    let notification;
    let targetRoom = null;

    if (broadcast === true) {
      notification = await Notification.create({
        user: null,
        title,
        message,
        type: type || "general",
        link,
        broadcast: true,
      });
    } else {
      if (!user) {
        return res.status(400).json({ message: "User ID required when not broadcasting" });
      }
      notification = await Notification.create({
        user,
        title,
        message,
        type,
        link,
        broadcast: false,
      });
      targetRoom = user.toString();
    }

    // ✅ Use getIO() instead of req.app.get("io")
    const io = getIO();
    if (broadcast) {
      io.emit("newNotification", notification);
      console.log("📢 Broadcast sent");
    } else {
      io.to(targetRoom).emit("newNotification", notification);
      console.log(`🔔 Notification sent to user ${targetRoom}`);
    }

    res.status(201).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


/* ================= GET USER ================= */

const getMyNotifications = async (req, res) => {
  try {
    const data = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= MARK READ ================= */

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id, // ⭐ security
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ================= */

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, // ⭐ security
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationRead,
  deleteNotification,
};