const express = require("express");
const {
  createRoom,
  getRoomsByHotel,
  getRoomById,
  updateRoom,
  deleteRoom,
  getAllRooms,
  searchRooms,
  updateRoomStatus
} = require("../controllers/roomController");
const upload = require("../middleware/upload");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/search", searchRooms);

router.post("/createroom", protect, upload.array("images", 6), createRoom);
router.get("/hotel/:hotelId", getRoomsByHotel);
router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.put("/:id", protect, upload.array("images", 6), updateRoom);
router.delete("/:id", protect, deleteRoom);
router.put("/:id/status", protect, updateRoomStatus);
module.exports = router;
