// models/appointmentModel.js
const { sql } = require("../config/dbConfig");

async function createAppointment(data) {
  const { surveyType, date, time, location, notes } = data;

  const request = new sql.Request();
  request.input("SurveyType", sql.NVarChar, surveyType);
  request.input("Date", sql.Date, date);
  request.input("Time", sql.NVarChar, time);
  request.input("Location", sql.NVarChar, location);
  request.input("Notes", sql.NVarChar, notes);

  const result = await request.query(`
    INSERT INTO Appointments (SurveyType, Date, Time, Location, Notes)
    VALUES (@SurveyType, @Date, @Time, @Location, @Notes)
  `);

  return result;
}

async function getAllAppointments() {
  const result = await sql.query(`SELECT * FROM Appointments ORDER BY CreatedAt DESC`);
  return result.recordset;
}

module.exports = {
  createAppointment,
  getAllAppointments,
};
