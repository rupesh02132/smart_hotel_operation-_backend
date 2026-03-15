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
app.use("/api/webhook", webhookRoutes);

/* ============================================================
   MIDDLEWARE
============================================================ */
require("./jobs/pricingScheduler");

// ✅ CORS
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

// ✅ BODY PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ COOKIES
app.use(cookieParser());

// ✅ LOGGER (DEV MODE)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ✅ STATIC FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("public"));

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

/* ============================================================
   ERROR HANDLER
============================================================ */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
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
  console.log(`🚀 Local Server: http://localhost:${PORT}`);

  if (process.env.NGROK_URL) {
    console.log(`🌍 Public (ngrok): ${process.env.NGROK_URL}`);
  }
});
