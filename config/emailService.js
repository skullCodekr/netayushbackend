const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

const sendOTPEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "NetAyush - Verify Your Email",
    html: `<h2>Your OTP is: ${otp}</h2><p>This OTP expires in 10 minutes.</p>`,
  });
};

const sendResetPasswordEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "NetAyush - Reset Your Password",
    html: `<h2>Your password reset OTP is: ${otp}</h2><p>This OTP expires in 10 minutes. If you didn't request this, ignore this email.</p>`,
  });
};

module.exports = { sendOTPEmail, sendResetPasswordEmail };
