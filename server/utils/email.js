/**
 * email.js
 * 
 * Panglao Tourist Data Management System - Email Utility
 * 
 * =========================
 * Overview:
 * =========================
 * This file provides utility functions for sending email notifications within the Panglao TDMS backend.
 * It uses the nodemailer library to send emails via a configured email service (e.g., Gmail) and is used for notifications such as account approval, password resets, and other user communications.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Email Notification: Sends emails to users for various events (e.g., registration, approval, password reset).
 * - Email Configuration: Sets up the nodemailer transporter using environment variables for security.
 * - Promise-based API: Exposes a promise-based function for sending emails, allowing for async/await usage in controllers.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses nodemailer for reliable email delivery.
 * - Reads email credentials (user and password) from environment variables for security.
 * - Supports both plain text and HTML email content.
 * - Centralizes email logic for maintainability and reusability across controllers.
 * - Logs success or error information for debugging and monitoring.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Imported and used in controllers (e.g., authController.js, adminController.js) to send notifications to users.
 * - Used for sending account approval, password reset, and other system-generated emails.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - Ensure EMAIL_USER and EMAIL_PASSWORD are set in the .env file.
 * - For Gmail, use an app-specific password if 2FA is enabled.
 * - Extend this file to add more specialized email templates or notification types as needed.
 * 
 * =========================
 * Related Files:
 * =========================
 * - controllers/authController.js   (calls sendEmailNotification for user-related emails)
 * - controllers/adminController.js  (calls sendEmailNotification for admin notifications)
 * - .env                           (stores email credentials)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21] 
 */
require("dotenv").config({ path: require('path').resolve(__dirname, "../../.env") });
const nodemailer = require("nodemailer");
const readline = require("readline");

// Use SendGrid SMTP for this test
const transporter = nodemailer.createTransport({
  host: process.env.SENDGRID_SMTP_HOST,
  port: Number(process.env.SENDGRID_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SENDGRID_SMTP_USER,
    pass: process.env.SENDGRID_SMTP_PASSWORD
  }
});

function sendTestEmail(to) {
  const mailOptions = {
    from: `"Panglao Tourism Office" <${process.env.SENDGRID_EMAIL_FROM}>`,
    to,
    subject: "TDMS Test Email via SendGrid SMTP",
    text: "This is a test email sent from the Panglao TDMS system using SendGrid SMTP.",
    html: `<p>This is a <b>test email</b> sent from the Panglao TDMS system using <b>SendGrid SMTP</b>.</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending email:", error);
    } else {
      console.log("✅ Email sent successfully:", info.response);
      console.log("📧 Message ID:", info.messageId);
    }
    process.exit();
  });
}

// If run directly, prompt for recipient and send
if (require.main === module) {
  const toArg = process.argv[2];
  if (toArg) {
    sendTestEmail(toArg);
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("Enter recipient email address: ", (to) => {
      rl.close();
      sendTestEmail(to);
    });
  }
}

// Export for use in other modules (optional)
module.exports = { sendTestEmail };