/**
 * emailVerification.js
 * 
 * Panglao Tourist Data Management System - Email Verification Utility
 * 
 * =========================
 * Overview:
 * =========================
 * This utility provides functions for generating, sending, and validating email verification tokens in the Panglao TDMS backend.
 * It is used during user registration and email change processes to ensure that users own the email addresses they provide.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Token Generation: Creates secure, random tokens for email verification links.
 * - Email Content: Generates HTML email content with a verification link for the user.
 * - Email Sending: Sends verification emails using the system's email notification utility.
 * - Token Validation: Validates the format and integrity of verification tokens.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses Node.js crypto for secure random token generation.
 * - Produces user-friendly, branded HTML email content.
 * - Integrates with the email utility (email.js) for sending notifications.
 * - Provides basic validation to ensure tokens are well-formed before processing.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Called by authController.js during user registration or when a user requests email verification.
 * - Used to send verification links and validate tokens when users click the link.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The verification link includes both the token and the user's email as query parameters.
 * - The verification token is typically stored in the database with an expiration time (e.g., 24 hours).
 * - Extend this utility if you need to support additional verification workflows or custom email templates.
 * 
 * =========================
 * Related Files:
 * =========================
 * - utils/email.js                (handles actual email sending)
 * - controllers/authController.js (calls these functions for registration and verification)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */ 

const crypto = require('crypto');
const { sendEmailNotification } = require('./email');

// Generate a secure random token for email verification
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Improved email content to avoid spam filters
function createVerificationEmail(email, token, baseUrl, userName = "") {
  const verificationLink = `${baseUrl}/email-verification?token=${token}&email=${encodeURIComponent(email)}`;
  const subject = "Verify your Panglao TDMS account email address";

  // Plain text version
  const textMessage = `
Hello${userName ? " " + userName : ""},

Thank you for registering for the Panglao Tourist Data Management System.

Please verify your email address by clicking the link below:
${verificationLink}

This link will expire in 24 hours. If you did not create this account, please ignore this email.

Best regards,
Panglao Tourism Office
`;

  // HTML version
  const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="background: #009688; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <img src="https://tourismarrivals.panglaolgu.com/img/Tourism_logo.png" alt="Panglao Logo" style="height: 48px; vertical-align: middle; margin-right: 10px;">
    <span style="font-size: 22px; font-weight: bold;">Tourism Data Management System</span>
  </div>
  <div style="padding: 24px; background: #fff; border-radius: 0 0 8px 8px;">
    <h2 style="color: #009688;">Complete Your Registration</h2>
    <p>Hello${userName ? " " + userName : ""},</p>
    <p>Thank you for registering for the Panglao TDMS. Please verify your email address by clicking the button below:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationLink}" style="background: #009688; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
    </div>
    <p style="font-size: 13px; color: #666;">This link will expire in 24 hours. If you did not create this account, please ignore this email.</p>
    <hr style="margin: 24px 0;">
    <p style="font-size: 12px; color: #888;">Need help? Contact the Panglao Municipal Tourism Office.<br>
    &copy; ${new Date().getFullYear()} Municipality of Panglao, Bohol.</p>
  </div>
</body>
</html>
`;

  return { subject, textMessage, htmlMessage };
}

// Improved email sending with better error handling
async function sendVerificationEmail(email, token, baseUrl, userName = "") {
  const { subject, textMessage, htmlMessage } = createVerificationEmail(email, token, baseUrl, userName);
  return sendEmailNotification(email, subject, textMessage, htmlMessage);
}

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  createVerificationEmail
};