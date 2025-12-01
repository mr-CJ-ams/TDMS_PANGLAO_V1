/**
 * email.js
 * 
 * Panglao Tourist Data Management System - Email Utility
 * Uses Gmail OAuth2 for secure email delivery on any server
 */

require("dotenv").config({ path: require('path').resolve(__dirname, "../../.env") });
const nodemailer = require("nodemailer");
const { google } = require('googleapis');

let transporter;

// Initialize Gmail transporter with OAuth2
async function initializeTransporter() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URL
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const accessToken = await oauth2Client.getAccessToken();

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token
      }
    });

    console.log('✅ Gmail OAuth2 is ready to send emails');
  } catch (error) {
    console.error('❌ OAuth2 initialization error:', error.message);
  }
}

// Verify transporter on startup
transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Gmail connection error:', error.message);
    console.log('⚠️  Attempting OAuth2 fallback...');
    initializeTransporter();
  } else {
    console.log('✅ Gmail is ready to send emails');
    console.log('📧 From email:', process.env.EMAIL_FROM);
  }
});

const sendEmailNotification = (email, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    text: message.replace(/<[^>]*>/g, ''),
    html: message
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Error sending email via Gmail:', error.message);
        reject(error);
      } else {
        console.log('✅ Email sent via Gmail');
        console.log("📧 Message ID:", info.messageId);
        resolve(info);
      }
    });
  });
};

module.exports = { sendEmailNotification, initializeTransporter };