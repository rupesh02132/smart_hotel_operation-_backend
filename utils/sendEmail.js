const nodemailer = require("nodemailer");
require("dotenv").config();


  //  ✅ TRANSPORT CONFIG (SMTP)


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


transporter.verify((error) => {
  if (error) {
    console.error("❌ Email error:", error.message);
  } else {
    console.log("✅ Email server ready");
  }
});

  //  ✅ SEND EMAIL FUNCTION

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const mailOptions = {
      from: `"Smart Hotel" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html, 
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.response);

    return info;

  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    throw new Error("Email failed to send");
  }
};

module.exports = sendEmail;