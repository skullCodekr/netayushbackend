const axios = require("axios");

const sendOTPEmail = async (toEmail, otp) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { email: "vaibhavper001@gmail.com", name: "NetAyush" },
      to: [{ email: toEmail }],
      subject: "NetAyush - Verify Your Email",
      htmlContent: `<h2>Your OTP is: ${otp}</h2><p>This OTP expires in 10 minutes.</p>`,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    },
  );
};

const sendResetPasswordEmail = async (toEmail, otp) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { email: "vaibhavper001@gmail.com", name: "NetAyush" },
      to: [{ email: toEmail }],
      subject: "NetAyush - Reset Your Password",
      htmlContent: `<h2>Your password reset OTP is: ${otp}</h2><p>This OTP expires in 10 minutes.</p>`,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    },
  );
};

module.exports = { sendOTPEmail, sendResetPasswordEmail };
