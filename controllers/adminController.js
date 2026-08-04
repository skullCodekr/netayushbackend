const bcrypt = require("bcryptjs");
const prisma = require("../config/prismaClient");

// Naya Admin banaна — SIRF existing admin kar sakta hai
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin",
      },
    });

    res
      .status(201)
      .json({ message: "New admin created successfully", userId: newAdmin.id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin delete karна — "Last Admin Protection" ke saath
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingAdminId = req.user.userId;

    const adminCount = await prisma.user.count({
      where: { role: "admin" },
    });

    if (adminCount <= 1) {
      return res.status(400).json({
        message:
          "Cannot delete the last remaining admin. At least one admin must exist.",
      });
    }

    if (parseInt(id) === requestingAdminId) {
      return res.status(400).json({
        message: "You cannot delete your own admin account.",
      });
    }

    await prisma.user.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Pending Doctor applications dekhने ke liye (bonus, useful hoगа)
const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await prisma.doctor.findMany({
      where: { isApproved: false },
      include: { user: { select: { name: true, email: true } } },
    });

    res.status(200).json(pendingDoctors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createAdmin, deleteAdmin, getPendingDoctors };
