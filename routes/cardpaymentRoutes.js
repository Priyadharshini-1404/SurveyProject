const express = require("express");
const router = express.Router();
const { addCardPayment } = require("../controllers/cardPaymentController");

// ✅ Define POST route
router.post("/", addCardPayment);

module.exports = router;
