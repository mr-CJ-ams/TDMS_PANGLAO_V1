const crypto = require('crypto');
const { sendEmailNotification } = require('./email');

// Generate a secure random token for email verification
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Create verification email content
function createVerificationEmail(email, token, baseUrl) {
  const verificationLink = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  
  const subject = "Verify Your Email - TDMS Registration";
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #00BCD4, #009688); color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Tourism Data Management System</h2>
        <p style="margin: 10px 0 0 0;">Email Verification Required</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h3 style="color: #333; margin-bottom: 20px;">Hello!</h3>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Thank you for registering with the Tourism Data Management System (TDMS). 
          To complete your registration, please verify your email address by clicking the button below.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background: #00BCD4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        
        <p style="background: #e9e9e9; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 12px; color: #333;">
          ${verificationLink}
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          This verification link will expire in 24 hours for security reasons.
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          If you didn't create an account with TDMS, please ignore this email.
        </p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2024 Tourism Data Management System. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">Panglao Tourism Office</p>
      </div>
    </div>
  `;
  
  return { subject, message };
}

// Send verification email
async function sendVerificationEmail(email, token, baseUrl) {
  try {
    const { subject, message } = createVerificationEmail(email, token, baseUrl);
    await sendEmailNotification(email, subject, message);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// Validate verification token
function validateToken(token) {
  // Basic validation - token should be 64 characters (32 bytes as hex)
  return token && token.length === 64 && /^[a-f0-9]+$/i.test(token);
}

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  validateToken,
  createVerificationEmail
}; 