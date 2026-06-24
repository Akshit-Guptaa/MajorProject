const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const aiController = require("../controllers/ai.js");

// AI routes
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "AI API is running" });
});

router.post("/generate-description", isLoggedIn, wrapAsync(aiController.generateDescription));

router.post("/chat", wrapAsync(aiController.chatWithAssistant));

module.exports = router;
