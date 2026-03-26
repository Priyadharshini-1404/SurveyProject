const CardPayment = require("../models/cardPaymentModel");

exports.addCardPayment = async (req, res) => {
  try {
    const { userName, surveyType, amount, paymentType, cardNumber, expiry, cvv } = req.body;

    if (!userName || !surveyType || !amount || !paymentType || !cardNumber || !expiry || !cvv) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await CardPayment.create({
      userName,
      surveyType,
      amount,
      paymentType,
      cardNumber,
      expiry,
      cvv,
    });

    return res.status(201).json({ message: "✅ Card payment added successfully!" });
  } catch (error) {
    console.error("❌ Error adding card payment:", error);
    return res.status(500).json({ message: "Error adding card payment", error: error.message });
  }
};
