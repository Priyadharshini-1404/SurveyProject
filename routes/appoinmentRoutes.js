// routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();
const { addAppointment, getAppointments } = require("../controllers/appoinmentController");

router.post("/", addAppointment); // POST /api/appointments
router.get("/", getAppointments); // GET /api/appointments

module.exports = router;
