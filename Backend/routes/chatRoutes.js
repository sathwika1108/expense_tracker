const express = require("express");
const { chatWithAssistant } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, chatWithAssistant);

module.exports = router;
