const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false"
  }
});

exports.sendEmailNotification = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    headers: {
      "X-Priority": "1",
      "X-Mailer": "TDMS",
      "Return-Path": process.env.EMAIL_FROM
    }
  });
};