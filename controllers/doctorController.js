const prisma = require("../config/prismaClient");

const applyAsDoctor = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { specialization, qualification, experience } = req.body;

    const existingProfile = await prisma.doctor.findUnique({
      where: { userId },
    });
    if (existingProfile) {
      return res
        .status(400)
        .json({ message: "Doctor application already submitted" });
    }

    const doctor = await prisma.doctor.create({
      data: {
        userId,
        specialization,
        qualification,
        experience: parseInt(experience),
        status: "pending",
      },
    });

    res.status(201).json({
      message: "Doctor application submitted, pending approval",
      doctor,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: "approved" },
      include: { user: { select: { name: true, email: true } } },
    });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: saari pending applications dekhne ke liye
const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: "pending" },
      include: { user: { select: { name: true, email: true } } },
    });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: { status: "approved" },
    });

    await prisma.user.update({
      where: { id: doctor.userId },
      data: { role: "doctor" },
    });

    res.status(200).json({ message: "Doctor approved successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: { status: "rejected" },
    });

    res.status(200).json({ message: "Doctor application rejected", doctor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logged-in doctor apna status check kare
const getMyDoctorStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const doctor = await prisma.doctor.findUnique({ where: { userId } });

    if (!doctor) {
      return res.status(200).json({ applied: false });
    }

    res.status(200).json({
      applied: true,
      status: doctor.status,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  applyAsDoctor,
  getAllDoctors,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getMyDoctorStatus,
};
