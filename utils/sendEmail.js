const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();




const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, attachments }) => {
  await transporter.sendMail({
    from: `"Smart Hotel" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    attachments,
  });
};

module.exports = sendEmail;

