const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const prisma = require("./config/prismaClient");

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("NetAyush backend is running!");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const doctorRoutes = require("./routes/doctorRoutes");
app.use("/api/doctors", doctorRoutes);

const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/api/appointments", appointmentRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// Har 5 minute mein check karo, unverified aur expired OTP wale users delete karo
setInterval(
  async () => {
    try {
      const deleted = await prisma.user.deleteMany({
        where: {
          isVerified: false,
          otpExpiry: { lt: new Date() },
        },
      });
      if (deleted.count > 0) {
        console.log(`${deleted.count} unverified expired users deleted`);
      }
    } catch (err) {
      console.error("Cleanup error:", err.message);
    }
  },
  5 * 60 * 1000,
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
