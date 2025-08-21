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

const nodemailer = require("nodemailer");

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
});

// Function to send email notification (Promise-based)
const sendEmailNotification = (email, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Use environment variable with fallback
    to: email,
    subject: subject,
    text: message,
    html: `<p>${message}</p>`, // Optional: Add HTML content for better formatting
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(error);
      } else {
        console.log("Email sent:", info.response);
        resolve(info);
      }
    });
  });
};

module.exports = { sendEmailNotification };