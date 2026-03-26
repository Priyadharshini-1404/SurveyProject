// controllers/appointmentController.js
const Appointment = require("../models/appoinmentModel");

exports.addAppointment = async (req, res) => {
  try {
    const { surveyType, date, time, location, notes } = req.body;

    if (!surveyType || !date || !time || !location) {
      return res.status(400).json({ message: "All required fields are missing" });
    }

    await Appointment.createAppointment({ surveyType, date, time, location, notes });

    res.status(201).json({ message: "Appointment created successfully" });
  } catch (error) {
    console.error("Error adding appointment:", error);
    res.status(500).json({ message: "Server error while creating appointment" });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getAllAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error while fetching data" });
  }
};
