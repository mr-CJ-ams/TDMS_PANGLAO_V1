/**
 * email.js
 * 
 * Panglao Tourist Data Management System - Email Utility
 * Uses Gmail App Password for reliable email delivery
 */

require("dotenv").config({ path: require('path').resolve(__dirname, "../../.env") });
const nodemailer = require("nodemailer");

let transporter;

// Initialize Gmail transporter
transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify transporter on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Gmail connection error:', error.message);
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

module.exports = { sendEmailNotification };