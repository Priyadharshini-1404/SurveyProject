const sql = require("mssql");
const { connectDB } = require("../config/dbConfig");

const CardPayment = {
  create: async (data) => {
    const pool = await connectDB();
    const query = `
      INSERT INTO CardPayments (userName, surveyType, amount, paymentType, cardNumber, expiry, cvv)
      VALUES (@userName, @surveyType, @amount, @paymentType, @cardNumber, @expiry, @cvv)
    `;

    await pool.request()
      .input("userName", sql.VarChar, data.userName)
      .input("surveyType", sql.VarChar, data.surveyType)
      .input("amount", sql.Decimal(10, 2), data.amount)
      .input("paymentType", sql.VarChar, data.paymentType)
      .input("cardNumber", sql.VarChar, data.cardNumber)
      .input("expiry", sql.VarChar, data.expiry)
      .input("cvv", sql.VarChar, data.cvv)
      .query(query);

    return { message: "Card payment inserted" };
  },
};

module.exports = CardPayment;
