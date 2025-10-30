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
function createVerificationEmail(email, token, baseUrl) {
  const verificationLink = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  
  const subject = "Verify your TDMS account email address";
  const message = `
    <div style="max-width:600px; margin:40px auto; text-align:center; font-family:Arial, sans-serif; color:#333;">
      <h2 style="color:#009688;">Panglao Municipal Tourism Office</h2> 
      <p>Thank you for registering with the Panglao Tourism Data Management System.</p>
      <p>Please verify your email address to activate your account.</p>
      <div style="margin:30px 0;">
        <a href="${verificationLink}" 
          style="background:#00BCD4; color:#fff; padding:12px 24px; text-decoration:none; border-radius:5px; display:inline-block; font-weight:600; font-size:15px;">
          Verify Email Address
        </a>
      </div>
      <p style="font-size:13px; color:#777;">Municipality of Panglao, Bohol</p>
    </div>

  `;
  
  return { subject, message };
}

// Improved email sending with better error handling
async function sendVerificationEmail(email, token, baseUrl) {
  try {
    const { subject, message } = createVerificationEmail(email, token, baseUrl);
    console.log(`📧 Sending verification email to: ${email}`);
    const result = await sendEmailNotification(email, subject, message);
    console.log(`✅ Verification email sent successfully to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email to ${email}:', error);
    return false;
  }
}

// Validate verification token
function validateToken(token) {
  return token && token.length === 64 && /^[a-f0-9]+$/i.test(token);
}

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  validateToken,
  createVerificationEmail
};