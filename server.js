const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const http = require("http");
const morgan = require("morgan");
const webhookRoutes = require("./routes/webhookRoutes");

dotenv.config();
connectDB();

const app = express();

/* ============================================================
   MIDDLEWARE
============================================================ */

// ✅ CORS (FIXED)
const allowedOrigins = [
  "http://localhost:3000",
  "https://smarthotel-beta.vercel.app",
  "https://smarthotel.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// ✅ BODY PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ COOKIES
app.use(cookieParser());

// ✅ LOGGER (DEV ONLY)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ✅ STATIC FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("public"));

// ✅ WEBHOOK (keep before json if raw needed)
app.use("/api/webhook", webhookRoutes);

// Background jobs
require("./jobs/pricingScheduler");

/* ============================================================
   ROUTES
============================================================ */

// Core routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/ratings", require("./routes/ratingRoutes"));
app.use("/api/payment", require("./routes/paymentRoute"));

// Smart Hotel routes
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/qr", require("./routes/qrRoutes"));
app.use("/api/invoice", require("./routes/invoiceRoutes"));
app.use("/api/pricing", require("./routes/pricingRoutes"));
app.use("/api/housekeeping", require("./routes/housekeepingRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

/* ============================================================
   ERROR HANDLER
============================================================ */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

/* ============================================================
   SOCKET.IO SETUP
============================================================ */
const server = http.createServer(app);
const { initSocket } = require("./utils/socket");
initSocket(server);

/* ============================================================
   START SERVER
============================================================ */
const PORT = process.env.PORT || 5354;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});