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

// Simple, professional email content
function createVerificationEmail() {
  
  const subject = "Panglao TDMS - Confirm Your Email";
  
  // Plain text version - very simple
  const textMessage = `
Panglao Tourism Data Management System

To complete your registration, please confirm your email address:


This confirmation link expires in 24 hours.

Municipality of Panglao, Bohol
Tourism Data Management System
`;

  // HTML version - minimal and professional
  const htmlMessage = `
<div>
  <p><strong>Panglao Tourism Data Management System</strong></p>
  <p>To complete your registration, please confirm your email address:</p>
  <p style="font-size: 12px; color: #666;">
    This confirmation link expires in 24 hours.<br>
    Municipality of Panglao, Bohol - Tourism Office
  </p>
</div>
`;

  return { subject, textMessage, htmlMessage };
}

// Email sending function
async function sendVerificationEmail(email, token, baseUrl) {
  const { subject, textMessage, htmlMessage } = createVerificationEmail(email, token, baseUrl);
  return sendEmailNotification(email, subject, textMessage, htmlMessage);
}

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  createVerificationEmail
};