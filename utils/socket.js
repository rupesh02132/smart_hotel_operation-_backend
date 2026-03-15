let io;

const initSocket = (server) => {
  const socketIo = require("socket.io");

  io = socketIo(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket Connected:", socket.id);

    // ===============================
    // JOIN ROOMS (Dashboards)
    // ===============================

    socket.on("joinHost", (hostId) => {
      socket.join(`host:${hostId}`);
      console.log("🏨 Host Joined:", hostId);
    });

    socket.on("joinStaff", () => {
      socket.join("staff");
      console.log("🧹 Staff Joined");
    });

    socket.on("joinManager", () => {
      socket.join("manager");
      console.log("🛎️ Manager Joined");
    });

    socket.on("joinCustomer", (userId) => {
      socket.join(`customer:${userId}`);
      console.log("👤 Customer Joined:", userId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

module.exports = { initSocket, getIO };
