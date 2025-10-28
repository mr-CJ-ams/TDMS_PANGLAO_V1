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

// Brevo SMTP configuration
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // false for port 587
  auth: {
    user: process.env.BREVO_EMAIL,     // Your Brevo account email
    pass: process.env.BREVO_SMTP_KEY   // Your Brevo SMTP key
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify transporter on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Brevo SMTP connection error:', error.message);
  } else {
    console.log('✅ Brevo SMTP server is ready to send emails');
  }
});

const sendEmailNotification = (email, subject, message) => {
  const mailOptions = {
    from: {
      name: "Panglao Tourism Office",
      address: process.env.EMAIL_FROM  // Still tourismarrivals@panglaolgu.com
    },
    to: email,
    subject: subject,
    text: message.replace(/<[^>]*>/g, ''),
    html: message,
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'TDMS Node.js'
    }
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Error sending email via Brevo:", error);
        reject(error);
      } else {
        console.log("✅ Email sent successfully via Brevo:", info.response);
        console.log("📧 Message ID:", info.messageId);
        resolve(info);
      }
    });
  });
};

module.exports = { sendEmailNotification };