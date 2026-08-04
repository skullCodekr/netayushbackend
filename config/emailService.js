const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (toEmail, otp) => {
  await resend.emails.send({
    from: "NetAyush <onboarding@resend.dev>",
    to: toEmail,
    subject: "NetAyush - Verify Your Email",
    html: `<h2>Your OTP is: ${otp}</h2><p>This OTP expires in 10 minutes.</p>`,
  });
};

const sendResetPasswordEmail = async (toEmail, otp) => {
  await resend.emails.send({
    from: "NetAyush <onboarding@resend.dev>",
    to: toEmail,
    subject: "NetAyush - Reset Your Password",
    html: `<h2>Your password reset OTP is: ${otp}</h2><p>This OTP expires in 10 minutes.</p>`,
  });
};

module.exports = { sendOTPEmail, sendResetPasswordEmail };
