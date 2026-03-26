const express = require("express");
const router = express.Router();
const path = require("path");

// Serve Razorpay Web Checkout Page
router.get("/razorpay-checkout", (req, res) => {
  const filePath = path.join(__dirname, "../views/razorpayWeb.html");
  res.sendFile(filePath);
});

module.exports = router;
