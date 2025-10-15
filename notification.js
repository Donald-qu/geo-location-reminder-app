// notifications.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // loads the .env variables

// Create the transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // you can change to another service if needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // app password if 2FA is on
  },
});

// Function to send email
export async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,       // recipient email
    subject,  // email subject
    text,     // email body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
