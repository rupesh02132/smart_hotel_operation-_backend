const express = require("express");
const upload = require("../middleware/upload");
const {
  getListings,
  getListingById,
  createListing,
  createMultipleListings,
  updateListing,
  deleteListing,
  getAllListings,

  // ✅ Missing Imports
  getHostListings,
  getMyListings,

} = require("../controllers/listingController");


const { authenticate, protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================================================
   PUBLIC ROUTES
============================================================ */
router.get("/", getListings);
router.get("/all", getAllListings);

/* ============================================================
   PROTECTED ROUTES
============================================================ */
router.get("/:id", protect, getListingById);

/* ============================================================
   HOST / ADMIN ROUTES
============================================================ */
router.post(
  "/create",
  protect,
  upload.fields([
    { name: "images", maxCount: 10 },     // files
    { name: "imageUrls", maxCount: 10 }   // URLs
  ]),
  createListing
);


router.put(
  "/:id",
  protect,
  authorize("host", "admin"),
  upload.array("images", 10),
  updateListing
);


router.post(
  "/createMultiple",
  protect,
  authorize("host", "admin"),
  createMultipleListings
);

router.put(
  "/:id/update",
  protect,
  authorize("host", "admin"),
  updateListing
);

router.delete(
  "/:id/delete",
  protect,
  authorize("host", "admin"),
  deleteListing
);


// ✅ Host Listings
router.get(
  "/host/my-listings",
  protect,
  authorize("host", "admin"),
  getHostListings
);

router.get(
  "/my-listings",
  protect,
  authorize("host", "admin"),
  getMyListings
);

module.exports = router;
