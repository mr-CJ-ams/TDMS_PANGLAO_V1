/**
 * email.js
 * 
 * Panglao Tourist Data Management System - Email Utility
 * Uses SendGrid or ZeptoMail API for reliable email delivery
 */

require("dotenv").config({ path: require('path').resolve(__dirname, "../../.env") });
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const axios = require("axios");

let transporter;

// Initialize based on provider
if (process.env.USE_ZEPTOMAIL === 'true') {
  // ZeptoMail via HTTP API (fixed structure)
  transporter = {
    sendMail: async (mailOptions, callback) => {
      try {
        // Clean the API key - remove any existing "Zoho-enczapikey" prefix
        const rawApiKey = process.env.ZEPTOMAIL_API_KEY.trim();
        const cleanApiKey = rawApiKey.replace(/^Zoho-enczapikey\s+/i, '');
        
        console.log('🔑 Using ZeptoMail API Key (first 10 chars):', cleanApiKey.substring(0, 10) + '...');

        // Prepare the email data according to ZeptoMail API spec
        const emailData = {
          from: {
            address: mailOptions.from.address,
            name: mailOptions.from.name
          },
          to: [
            {
              email_address: {
                address: mailOptions.to
              }
            }
          ],
          subject: mailOptions.subject,
          htmlbody: mailOptions.html,
          textbody: mailOptions.text
        };

        console.log('📧 Sending ZeptoMail to:', mailOptions.to);

        const response = await axios.post('https://api.zeptomail.com/v1.1/email', emailData, {
          headers: {
            'Authorization': `Zoho-enczapikey ${cleanApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        console.log('✅ ZeptoMail API response:', response.data);

        callback(null, {
          messageId: response.data.id || response.data.data?.message_id,
          response: response.data
        });
      } catch (error) {
        console.error('❌ ZeptoMail API error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          message: error.message
        });
        
        // More specific error handling
        if (error.response?.status === 401) {
          console.error('🔐 Authentication failed - check your API key');
        } else if (error.response?.status === 403) {
          console.error('🚫 Permission denied - verify sender email is authorized');
        } else if (error.response?.status === 500) {
          console.error('⚡ Server error - check API key format and request structure');
        }
        
        callback(error);
      }
    }
  };
} else {
  // SendGrid (default)
  transporter = nodemailer.createTransport(sgTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  }));
}

// Verify transporter on startup
if (process.env.USE_ZEPTOMAIL === 'true') {
  console.log('✅ ZeptoMail API is configured');
  console.log('📧 From email:', process.env.EMAIL_FROM);
  
  // Test API key format
  const rawApiKey = process.env.ZEPTOMAIL_API_KEY?.trim() || '';
  const cleanApiKey = rawApiKey.replace(/^Zoho-enczapikey\s+/i, '');
  
  if (!cleanApiKey) {
    console.error('❌ ZEPTOMAIL_API_KEY is empty or invalid');
  } else if (rawApiKey !== cleanApiKey) {
    console.log('⚠️  API key was cleaned (removed duplicate prefix)');
  }
} else {
  transporter.verify(function (error, success) {
    if (error) {
      console.error('❌ SendGrid connection error:', error.message);
    } else {
      console.log('✅ SendGrid API is ready to send emails');
    }
  });
}

const sendEmailNotification = (email, subject, message) => {
  const mailOptions = {
    from: {
      name: "Panglao TDMS",
      address: process.env.EMAIL_FROM
    },
    to: email,
    subject: subject,
    text: message.replace(/<[^>]*>/g, ''),
    html: message
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        const provider = process.env.USE_ZEPTOMAIL === 'true' ? 'ZeptoMail' : 'SendGrid';
        console.error(`❌ Error sending email via ${provider}:`, error.response?.data || error.message);
        reject(error);
      } else {
        const provider = process.env.USE_ZEPTOMAIL === 'true' ? 'ZeptoMail' : 'SendGrid';
        console.log(`✅ Email sent via ${provider}:`, info.response);
        console.log("📧 Message ID:", info.messageId);
        resolve(info);
      }
    });
  });
};

module.exports = { sendEmailNotification };