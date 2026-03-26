const sql = require("mssql");
const { connectDB } = require("../config/dbConfig");

exports.createPayment = async (payment) => {
  const pool = await connectDB();

  const result = await pool
    .request()
    .input("UserName", sql.VarChar, payment.userName)
    .input("SurveyType", sql.VarChar, payment.surveyType)
    .input("StaffName", sql.VarChar, payment.selectedStaff)
    .input("Date", sql.VarChar, payment.date)
    .input("Time", sql.VarChar, payment.time)
    .input("SiteLocation", sql.VarChar, payment.location)
    .input("AdditionalNotes", sql.VarChar, payment.notes)
    .input("Amount", sql.Decimal(10, 2), payment.amount)
    .input("PaymentType", sql.VarChar, payment.paymentType)
    .input("PaymentStatus", sql.VarChar, payment.paymentStatus)
    .input("ContactNumber", sql.VarChar, payment.contactNumber || null)
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

  return result;
};
