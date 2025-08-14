const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const cron = require("node-cron");
const { sendEmailNotification } = require("./utils/email");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/build")));

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const submissionsRoutes = require("./routes/submissions");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/api/submissions", submissionsRoutes);

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.get('/api/test-error', (req, res, next) => {
  // This will trigger the error handler
  next(new Error('This is a test error!'));
});

// Add this at the very end, after all routes and other middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Optionally, include stack trace in development only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 1st day of the month: Reminder to start submitting
cron.schedule("0 8 1 * *", async () => {
  try {
    const result = await pool.query("SELECT email FROM users WHERE is_active = TRUE AND email_verified = TRUE");
    const emails = result.rows.map(row => row.email);

    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const deadline = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-10 11:59 PM`;

    const subject = "TDMS Monthly Submission Reminder";
    const message = `
      <p>Dear TDMS User,</p>
      <p>This is a friendly reminder that you can now start submitting your data for <strong>${year}-${String(lastMonth).padStart(2, "0")}</strong> in the Tourism Data Management System (TDMS).</p>
      <p><strong>Deadline for submission is on the 10th day of this month (${deadline}).</strong></p>
      <p>Please log in and complete your submission as soon as possible to avoid penalties.</p>
      <p>If you have any questions, please contact the Panglao Tourism Office.</p>
      <br>
      <p>Thank you,<br>Panglao Tourism Office</p>
    `;

    for (const email of emails) {
      await sendEmailNotification(email, subject, message);
    }
    console.log(`[CRON] 1st-day reminder emails sent to ${emails.length} users.`);
  } catch (err) {
    console.error("[CRON] Failed to send 1st-day reminder emails:", err);
  }
});

// 9th day of the month: Deadline is tomorrow
cron.schedule("0 8 9 * *", async () => {
  try {
    const result = await pool.query("SELECT email FROM users WHERE is_active = TRUE AND email_verified = TRUE");
    const emails = result.rows.map(row => row.email);

    const now = new Date();
    const deadline = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-10 11:59 PM`;

    const subject = "TDMS Submission Deadline Reminder";
    const message = `
      <p>Dear TDMS User,</p>
      <p>This is a reminder that <strong>the deadline for submitting your data is tomorrow (${deadline})</strong> in the Tourism Data Management System (TDMS).</p>
      <p>Please log in and complete your submission to avoid penalties.</p>
      <p>If you have already submitted, please disregard this message.</p>
      <br>
      <p>Thank you,<br>Panglao Tourism Office</p>
    `;

    for (const email of emails) {
      await sendEmailNotification(email, subject, message);
    }
    console.log(`[CRON] 9th-day deadline reminder emails sent to ${emails.length} users.`);
  } catch (err) {
    console.error("[CRON] Failed to send 9th-day deadline reminder emails:", err);
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});