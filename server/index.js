/**
 * index.js
 * 
 * Panglao Tourist Data Management System - Main Server Entry Point
 * 
 * =========================
 * Overview:
 * =========================
 * This file serves as the main entry point for the Panglao TDMS backend server. It initializes the Express application, configures middleware, sets up static file serving, registers all API routes, handles errors, and schedules automated tasks (cron jobs) for system notifications.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Express App Initialization: Sets up the Express server and configures core middleware (CORS, JSON parsing).
 * - Static File Serving: Serves uploaded files and the built React frontend from the appropriate directories.
 * - API Routing: Registers all main API route modules for authentication, admin, and submissions.
 * - Error Handling: Provides a global error handler for catching and formatting unhandled errors.
 * - Cron Jobs: Schedules and executes automated email reminders for monthly data submissions using node-cron.
 * - Server Startup: Listens on the configured port and logs server status.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Modular route structure for scalability and maintainability.
 * - Centralized error handling for consistent API responses.
 * - Automated monthly and deadline email reminders to users via cron jobs.
 * - Serves both API and static frontend assets for a unified deployment.
 * - Uses environment variables for configuration (port, database, etc.).
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Run with `node index.js` or via a process manager (e.g., PM2, systemd) in production.
 * - Handles all backend API requests and serves the frontend React app.
 * - Automatically sends reminder emails to users at scheduled times.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - Add new API routes by importing and registering them here.
 * - Update cron job logic as needed for new notification or automation features.
 * - Ensure environment variables are set in .env for configuration.
 * - For custom error handling, modify the error middleware at the end of this file.
 * 
 * =========================
 * Related Files:
 * =========================
 * - routes/auth.js, routes/admin.js, routes/submissions.js (API route definitions)
 * - utils/email.js (email notification utility)
 * - db.js (database connection pool)
 * - client/build (React frontend static files)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const cron = require("node-cron");
const { sendEmailNotification } = require("./utils/email");
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "..", "client", "build")));

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const submissionsRoutes = require("./routes/submissions");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/submissions", submissionsRoutes);

// ADD THIS ROUTE - IP Detection for Render
app.get('/api/server-info', async (req, res) => {
  try {
    const publicIP = await getPublicIP();
    
    const serverInfo = {
      timestamp: new Date().toISOString(),
      publicIP: publicIP,
      renderInstance: process.env.RENDER ? 'Yes' : 'No',
      host: req.headers.host,
      // These headers help identify the actual client IP behind Render's proxy
      clientIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      realIP: req.ip,
      // Render-specific headers
      renderHeaders: {
        xForwardedFor: req.headers['x-forwarded-for'],
        xRealIP: req.headers['x-real-ip'],
        xForwardedHost: req.headers['x-forwarded-host'],
        xForwardedProto: req.headers['x-forwarded-proto']
      }
    };

    console.log('Server Info Requested:', serverInfo);
    
    res.json({
      success: true,
      message: 'Use the publicIP value for your SPF record update',
      data: serverInfo,
      spfInstructions: `Give this IP to IT for SPF update: ip4:${publicIP}`
    });
  } catch (error) {
    console.error('Error getting server info:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to get public IP
async function getPublicIP() {
  return new Promise((resolve, reject) => {
    const https = require('https');
    https.get('https://api.ipify.org', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => {
      reject(err);
    });
  });
}


// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  // only handle browser GET requests that accept HTML
  if (req.method !== 'GET') return res.status(404).end();
  const accept = req.headers.accept || '';
  if (!accept.includes('text/html')) return res.status(404).end();

  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
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