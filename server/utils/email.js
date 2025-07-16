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
    from: process.env.EMAIL_USER || "ubshsgr12stemamaquinc@gmail.com", // Use environment variable with fallback
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