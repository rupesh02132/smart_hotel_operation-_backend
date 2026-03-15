const express = require("express");
const { chatbotReply } = require("../controllers/chatbotController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", chatbotReply);

module.exports = router;
