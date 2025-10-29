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

// Choose SMTP provider based on ENV
const provider = process.env.EMAIL_PROVIDER || "panglao"; // "panglao" or "sendgrid"

let transporter;
if (provider === "sendgrid") {
  transporter = nodemailer.createTransport({
    host: process.env.SENDGRID_SMTP_HOST,
    port: Number(process.env.SENDGRID_SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SENDGRID_SMTP_USER,
      pass: process.env.SENDGRID_SMTP_PASSWORD
    }
  });
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Verify transporter on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ SMTP connection error:', error.message);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

const sendEmailNotification = async (to, subject, html) => {
  const from = provider === "sendgrid"
    ? process.env.SENDGRID_EMAIL_FROM
    : process.env.EMAIL_FROM;

  const mailOptions = {
    from: `Panglao Tourism Office <${from}>`,
    to,
    subject,
    text: html.replace(/<[^>]*>/g, ''), // Plain text fallback
    html,
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'TDMS Node.js'
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent via ${provider} to:`, to);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error);
    throw error;
  }
};

module.exports = { sendEmailNotification };