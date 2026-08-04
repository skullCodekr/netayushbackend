const prisma = require("../config/prismaClient");

// Customer: Book appointment
const bookAppointment = async (req, res) => {
  try {
    const customerId = req.user.userId; // Token se aaya, body se nahi
    const { doctorId, slot } = req.body;

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor || !doctor.isApproved) {
      return res
        .status(400)
        .json({ message: "Doctor not found or not approved" });
    }

    const appointment = await prisma.appointment.create({
      data: { customerId, doctorId, slot },
    });

    res.status(201).json({
      message: "Appointment booked, pending doctor confirmation",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Doctor: View own appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: parseInt(doctorId) },
      include: { customer: { select: { name: true, email: true } } },
    });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Doctor: Accept/Reject appointment
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res.status(200).json({ message: `Appointment ${status}`, appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Customer: View own appointments
const getCustomerAppointments = async (req, res) => {
  try {
    const customerId = req.user.userId; // Token se, URL params se nahi

    const appointments = await prisma.appointment.findMany({
      where: { customerId },
      include: { doctor: { include: { user: { select: { name: true } } } } },
    });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  bookAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getCustomerAppointments,
};
