const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment } = require("../controllers/paymentController");

router.post("/order", createOrder);       // POST /api/payments/order
router.post("/verify", verifyPayment);    // POST /api/payments/verify

module.exports = router;
