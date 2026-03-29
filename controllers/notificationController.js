const Notification = require("../models/Notification");

/* ================= CREATE ================= */

const createNotification = async (req, res) => {
  try {
    const { user, title, message, type, link } = req.body;

    if (!user || !title || !message) {
      return res.status(400).json({
        message: "Missing required notification fields",
      });
    }

    const notification = await Notification.create({
      user,
      title,
      message,
      type,
      link,
    });

    /* ⭐ socket emit */
    const io = req.app.get("io");

    if (io) {
      io.to(user.toString()).emit(
        "newNotification",
        notification
      );
    }

    res.status(201).json(notification);
  } catch (err) {
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