const Razorpay = require("razorpay");
const crypto = require("crypto");
const sql = require("mssql");
const { connectDB } = require("../config/dbConfig");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------- CREATE ORDER ----------------
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,   // ₹10 becomes 100 paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

   res.json({
  success: true,
  order: {
    id: order.id,
    amount: order.amount,
    currency: order.currency
  },
  key: process.env.RAZORPAY_KEY_ID
});
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
};

// ---------------- VERIFY PAYMENT ----------------
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentData, // full payment details from frontend
    } = req.body;

    // Signature check
    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // SAVE PAYMENT INTO DATABASE
    const pool = await connectDB();

    await pool
      .request()
      .input("UserName", sql.VarChar, paymentData.userName)
      .input("SurveyType", sql.VarChar, paymentData.surveyType)
      .input("StaffName", sql.VarChar, paymentData.selectedStaff)
      .input("Date", sql.VarChar, paymentData.date)
      .input("Time", sql.VarChar, paymentData.time)
      .input("SiteLocation", sql.VarChar, paymentData.location)
      .input("AdditionalNotes", sql.VarChar, paymentData.notes)
      .input("Amount", sql.Decimal(10, 2), paymentData.amount)
      .input("PaymentType", sql.VarChar, "Online")
      .input("PaymentStatus", sql.VarChar, "Success")
      .input("ContactNumber", sql.VarChar, paymentData.contactNumber)
      .query(`
        INSERT INTO Payments (
          UserName, SurveyType, StaffName, Date, Time,
          SiteLocation, AdditionalNotes, Amount, PaymentType,
          PaymentStatus, ContactNumber
        )
        VALUES (
          @UserName, @SurveyType, @StaffName, @Date, @Time,
          @SiteLocation, @AdditionalNotes, @Amount, @PaymentType,
          @PaymentStatus, @ContactNumber
        )
      `);

    res.json({
      success: true,
      message: "Payment verified & saved",
    });
  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
