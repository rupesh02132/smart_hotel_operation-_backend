const { authenticate, protect, authorize } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const { getHostRoomStatus ,
    markRoomCleaned,
    availability,
    getHousekeepingTasks

} = require("../controllers/housekeepingController");

// ✅ Host Room Status Overview
router.get(
  "/host/status",
  protect,
  authorize("host", "admin"),
  getHostRoomStatus
);


// ✅ Housekeeping Clean Route
router.put(
  "/clean/:id",
  protect,
  authorize("staff", "admin"),
  markRoomCleaned
);

// ✅ Availability Route
router.post(
  "/:id/availability",
  protect,
  authorize("admin"),
  availability
);


router.get(
  "/tasks",
  protect,
  authorize("staff", "admin"),
  getHousekeepingTasks
);



module.exports = router;