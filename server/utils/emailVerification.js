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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #00BCD4, #009688); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 24px;">Tourism Data Management System</h2>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Municipality of Panglao, Bohol</p>
      </div>
      
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <h3 style="color: #2c3e50; margin-bottom: 20px;">Complete Your Registration</h3>
        
        <p style="margin-bottom: 20px;">Hello,</p>
        
        <p style="margin-bottom: 20px;">You recently registered for the Tourism Data Management System. To activate your account and start submitting tourism data, please verify your email address.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background: #00BCD4; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px; border: none; cursor: pointer;">
            Verify Email Address
          </a>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Note:</strong> This verification link expires in 24 hours. If you didn't create this account, please ignore this email.
          </p>
        </div>
        
        <p style="margin-bottom: 10px; font-size: 14px; color: #666;">Need help? Contact the Panglao Municipal Tourism Office.</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Municipality of Panglao, Bohol. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This is an automated message from the Tourism Data Management System.</p>
      </div>
    </body>
    </html>
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