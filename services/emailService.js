// Service for sending emails
const nodemailer = require("nodemailer");
require("dotenv").config();
const {
  // findUpcomingProjects,
  generateSharedLinkToken,
  recordSentEmail,
} = require("./projectService");

const transporter = nodemailer.createTransport({
  //   secure: false,
  port: 587,
  //   tls: { rejectUnauthorized: false },
  //   server: "smtp.titan.email",

  host: "smtp.titan.email",
  auth: {
    user: "test@bloxat.app",
    pass: process.env.MAIL_PASS,
  },
});

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"; // Default to localhost if not provided

async function sendReminderEmail(to, projectName, sharedLinkToken) {
  const subject = `${projectName} Start Reminder`;
  const text = `Click the link to view the project details: ${BASE_URL}/api/v1/clients/${sharedLinkToken}`;

  const mailOptions = {
    from: "test@bloxat.app",
    to: to,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions);
}

// async function sendEmail(to, subject, text) {
//   const mailOptions = {
//     from: "test@bloxat.app",
//     to: to,
//     subject: subject,
//     text: text,
//   };

//   return transporter.sendMail(mailOptions);
// }

module.exports = { sendReminderEmail };
