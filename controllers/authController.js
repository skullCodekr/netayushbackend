const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/prismaClient");
const {
  sendOTPEmail,
  sendResetPasswordEmail,
} = require("../config/emailService");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    let user;
    if (existingUser && !existingUser.isVerified) {
      // Previous attempt never got verified — overwrite instead of creating junk rows
      user = await prisma.user.update({
        where: { email },
        data: { name, password: hashedPassword, otp, otpExpiry },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "customer",
          otp,
          otpExpiry,
        },
      });
    }

    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "User registered. Please check your email for OTP verification.",
      userId: user.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// VERIFY OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpiry: null },
    });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in" });
    }

    // Sirf Doctor select karne pe hi strict check — doctor profile hona chahiye
    if (role === "doctor") {
      const doctorProfile = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });
      if (!doctorProfile) {
        return res
          .status(403)
          .json({ message: "No doctor account found with these credentials" });
      }
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res
      .status(200)
      .json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// FORGOT PASSWORD - Step 1: request OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Security note: don't reveal whether email exists or not
    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, a reset OTP has been sent.",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    await sendResetPasswordEmail(email, otp);

    res.status(200).json({
      message: "If that email is registered, a reset OTP has been sent.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// FORGOT PASSWORD - Step 2: verify OTP + set new password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, otp: null, otpExpiry: null },
    });

    res
      .status(200)
      .json({ message: "Password reset successful. Please login." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  register,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getMe,
};
