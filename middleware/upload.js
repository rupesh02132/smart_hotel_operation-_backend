const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/* ======================
   FILE FILTER
====================== */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
  }
};

/* ======================
   CLOUDINARY STORAGE
====================== */
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "smart-hotel/listings",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1600, crop: "limit" }],
  },
});

/* ======================
   LOCAL FALLBACK STORAGE
====================== */
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/* ======================
   STORAGE SELECTOR
====================== */
const storage =
  process.env.USE_CLOUDINARY === "true"
    ? cloudinaryStorage
    : localStorage;

/* ======================
   MULTER INSTANCE
====================== */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;








// const multer = require("multer");
// const path = require("path");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// /* ======================
//    FILE FILTER (ONLY IMAGES)
// ====================== */
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|webp/;

//   const ext = allowedTypes.test(
//     path.extname(file.originalname).toLowerCase()
//   );

//   const mime = allowedTypes.test(file.mimetype);

//   if (ext && mime) {
//     cb(null, true);
//   } else {
//     cb(new Error("❌ Only JPG, JPEG, PNG, WEBP allowed"));
//   }
// };

// /* ======================
//    CLOUDINARY STORAGE ONLY
// ====================== */
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "smart-hotel/listings",
//     allowed_formats: ["jpg", "jpeg", "png", "webp"],
//     transformation: [{ width: 1600, crop: "limit" }],
//   },
// });

// /* ======================
//    MULTER INSTANCE
// ====================== */
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });

// module.exports = upload;
