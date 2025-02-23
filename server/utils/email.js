const nodemailer = require("nodemailer");

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service
  auth: {
    user: "amaquincj00@gmail.com", // Your email
    pass: "zpea oelc jein ryyz", // Your email password or app-specific password
  },
});

// Function to send email notification
const sendEmailNotification = (email, subject, message) => {
  const mailOptions = {
    from: "amaquincj00@gmail.com",
    to: email,
    subject: subject,
    text: message,
    html: `<p>${message}</p>`, // Optional: Add HTML content for better formatting
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = { sendEmailNotification };