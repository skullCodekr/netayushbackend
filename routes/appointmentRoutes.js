const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  bookAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getCustomerAppointments,
} = require("../controllers/appointmentController");

router.post("/book", protect, bookAppointment);
router.get("/my-appointments", protect, getCustomerAppointments); // URL simplify ho gaya, ab param nahi chahiye
router.get("/doctor/:doctorId", protect, getDoctorAppointments);
router.put("/:id/status", protect, updateAppointmentStatus);

module.exports = router;
