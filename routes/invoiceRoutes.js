const express = require("express");
const { downloadInvoice } = require("../controllers/invoiceController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:id", downloadInvoice);

module.exports = router;

