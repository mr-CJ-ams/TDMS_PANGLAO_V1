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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// SMTP transporter using your .env config (not SendGrid)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify transporter on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ SMTP connection error:', error.message);
    process.exit(1);
  } else {
    console.log('✅ SMTP server is ready to send emails');
    askRecipient();
  }
});

// Prompt for recipient and send email
function askRecipient() {
  rl.question("Enter recipient Gmail address: ", function (recipient) {
    if (!recipient || !/^[^@]+@gmail\.com$/.test(recipient.trim())) {
      console.log("❌ Please enter a valid Gmail address.");
      return askRecipient();
    }
    sendTestEmail(recipient.trim());
  });
}

function sendTestEmail(email) {
  const subject = "Panglao TDMS Test Email";
  const html = `
    <h2 style="color:#009688;">Panglao Tourism Office</h2>
    <p>This is a test email sent from the Panglao TDMS system using your SMTP settings.</p>
    <p>If you received this in your inbox (not spam), your configuration is correct!</p>
    <hr>
    <small>Sent at ${new Date().toLocaleString()}</small>
  `;

  const mailOptions = {
    from: {
      name: "Panglao Municipal Tourism Office",
      address: process.env.EMAIL_FROM
    },
    to: email,
    subject: subject,
    text: "This is a test email sent from the Panglao TDMS system using your SMTP settings.",
    html: html,
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'TDMS Node.js'
    }
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending email:", error);
    } else {
      console.log("✅ Email sent successfully:", info.response);
      console.log("📧 Message ID:", info.messageId);
    }
    rl.close();
    process.exit(0);
  });
}