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
const { google } = require("googleapis");
const { exec } = require("child_process");
const util = require("util");
const fs = require("fs");
require('dotenv').config();

const execPromise = util.promisify(exec);
const app = express();

// =============================================================================
// BACKUP SYSTEM CONFIGURATION
// =============================================================================

// Google Drive API scope for file access
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

/**
 * Loads OAuth2 credentials from environment variable or file
 */
function loadCredentials() {
  // Try to get credentials from environment variable first (for Render.com)
  if (process.env.GOOGLE_OAUTH_CREDENTIALS_JSON) {
    console.log("📁 Loading credentials from environment variable...");
    return JSON.parse(process.env.GOOGLE_OAUTH_CREDENTIALS_JSON);
  }
  
  // Fallback to file system (for local development)
  const CREDENTIALS_PATH = path.resolve(__dirname, process.env.GOOGLE_OAUTH_CREDENTIALS_PATH || "./config/client_secret.json");
  console.log("📁 Loading credentials from file:", CREDENTIALS_PATH);
  return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
}

/**
 * Loads token from environment variable or file
 */
function loadToken() {
  // Try to get token from environment variable first (for Render.com)
  if (process.env.GOOGLE_OAUTH_TOKEN_JSON) {
    console.log("🔑 Loading token from environment variable...");
    return JSON.parse(process.env.GOOGLE_OAUTH_TOKEN_JSON);
  }
  
  // Fallback to file system (for local development)
  const TOKEN_PATH = path.join(__dirname, "driveBackup/token.json");
  console.log("🔑 Loading token from file:", TOKEN_PATH);
  
  if (fs.existsSync(TOKEN_PATH)) {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  }
  
  throw new Error("No OAuth token found. Please set GOOGLE_OAUTH_TOKEN_JSON environment variable.");
}

/**
 * Creates a PostgreSQL database dump using pg_dump
 */
async function createDatabaseDump() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dumpFileName = `panglao_tdms_backup_${timestamp}.dump`;
  const dumpFilePath = path.join(__dirname, "driveBackup", dumpFileName);
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set");
    return null;
  }
  
  try {
    console.log(`🔄 Creating database dump: ${dumpFileName}`);
    
    // Use pg_dump to create backup
    const { stdout, stderr } = await execPromise(
      `pg_dump "${connectionString}" --format=custom --file="${dumpFilePath}"`
    );
    
    if (stderr) {
      console.warn("pg_dump warnings:", stderr);
    }
    
    console.log(`✅ Database dump created: ${dumpFileName}`);
    return dumpFilePath;
    
  } catch (error) {
    console.error("❌ Failed to create database dump:", error.message);
    return null;
  }
}

/**
 * Uploads a file to Google Drive in the specified folder.
 */
async function uploadFile(auth, filePath, fileName, folderId) {
  const drive = google.drive({ version: "v3", auth });
  try {
    const res = await drive.files.create({
      resource: {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType: "application/octet-stream",
        body: fs.createReadStream(filePath),
      },
      fields: "id, name, webViewLink, createdTime, size",
    });
    console.log("✅ File uploaded to Google Drive:", res.data.name);
    return res.data;
  } catch (err) {
    console.error("❌ Error uploading file:", err);
    return null;
  }
}

/**
 * Lists backup files in a specific Google Drive folder.
 */
async function listBackupFiles(auth, folderId) {
  const drive = google.drive({ version: "v3", auth });
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and name contains 'panglao_tdms_backup_' and trashed = false`,
      fields: "files(id, name, createdTime, size)",
      orderBy: "createdTime",
    });
    return res.data.files || [];
  } catch (err) {
    console.error("Error listing files:", err);
    return [];
  }
}

/**
 * Deletes a file from Google Drive by file ID.
 */
async function deleteFile(auth, fileId) {
  const drive = google.drive({ version: "v3", auth });
  try {
    await drive.files.delete({ fileId });
    console.log("🗑️ Deleted old backup file from Google Drive");
  } catch (err) {
    console.error("Error deleting file:", err);
  }
}

/**
 * Cleans up local dump file after upload
 */
function cleanupLocalFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🧹 Cleaned up local file: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error("Error cleaning up local file:", error.message);
  }
}

/**
 * Manages backup retention - deletes oldest files when limit is reached
 */
async function manageRetention(auth, folderId, maxBackups, backupType) {
  try {
    const backupFiles = await listBackupFiles(auth, folderId);
    
    if (backupFiles.length >= maxBackups) {
      console.log(`📊 ${backupType} folder has ${backupFiles.length} files (max: ${maxBackups})`);
      
      // Sort by creation time (oldest first)
      backupFiles.sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime));
      
      // Calculate how many files to delete
      const filesToDeleteCount = backupFiles.length - maxBackups + 1; // +1 because we're about to add a new file
      const filesToDelete = backupFiles.slice(0, filesToDeleteCount);
      
      console.log(`🧹 Need to delete ${filesToDeleteCount} old ${backupType.toLowerCase()} backup(s)`);
      
      // Delete the oldest files
      for (const file of filesToDelete) {
        console.log(`🗑️ Deleting: ${file.name} (${new Date(file.createdTime).toLocaleDateString()})`);
        await deleteFile(auth, file.id);
      }
      
      return filesToDeleteCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error managing ${backupType.toLowerCase()} retention:`, error.message);
    return 0;
  }
}

/**
 * Performs backup and uploads to specified folder with retention management
 */
async function performScheduledBackup(auth, folderId, maxBackups, backupType) {
  console.log(`\n⏰ [${new Date().toISOString()}] Starting ${backupType.toLowerCase()} backup...`);
  
  try {
    // 1. Manage retention first (delete old files if needed)
    const deletedCount = await manageRetention(auth, folderId, maxBackups, backupType);
    
    // 2. Create database dump
    const dumpFilePath = await createDatabaseDump();
    if (!dumpFilePath) {
      console.log("❌ Backup aborted: Could not create database dump");
      return;
    }
    
    const fileName = path.basename(dumpFilePath);
    
    // 3. Upload to Google Drive
    const uploadResult = await uploadFile(auth, dumpFilePath, fileName, folderId);
    
    if (uploadResult) {
      console.log(`✅ ${backupType} backup completed successfully!`);
      console.log(`📁 File: ${uploadResult.name}`);
      console.log(`🔗 View: ${uploadResult.webViewLink}`);
      console.log(`💾 Size: ${Math.round(uploadResult.size / 1024 / 1024)}MB`);
      
      if (deletedCount > 0) {
        console.log(`🗑️ Cleaned up ${deletedCount} old backup(s) to maintain limit of ${maxBackups}`);
      }
    }
    
    // 4. Clean up local dump file
    cleanupLocalFile(dumpFilePath);
    
  } catch (error) {
    console.error(`❌ ${backupType} backup failed:`, error.message);
  }
}

/**
 * Initialize the backup system
 */
function initializeBackupSystem() {
  try {
    console.log("🚀 Initializing Automated Backup System...");
    
    // Load credentials and configuration
    const credentials = loadCredentials();
    const GDRIVE_DAILY_FOLDER_ID = process.env.GDRIVE_DAILY_FOLDER_ID;
    const GDRIVE_MONTHLY_FOLDER_ID = process.env.GDRIVE_MONTHLY_FOLDER_ID;
    const MAX_DAILY_BACKUPS = parseInt(process.env.MAX_DAILY_BACKUPS, 10) || 31;
    const MAX_MONTHLY_BACKUPS = parseInt(process.env.MAX_MONTHLY_BACKUPS, 10) || 12;

    // Validate required environment variables
    if (!GDRIVE_DAILY_FOLDER_ID || !GDRIVE_MONTHLY_FOLDER_ID) {
      console.warn("⚠️  Backup system disabled: Missing Google Drive folder IDs");
      return;
    }

    // Load token and authenticate
    const token = loadToken();
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, 
      client_secret, 
      redirect_uris ? redirect_uris[0] : 'http://localhost'
    );
    
    oAuth2Client.setCredentials(token);
    console.log("✅ Google Drive authentication successful!");

    console.log("🚀 Starting automated backup system...");
    console.log(`📁 Daily backups folder: ${GDRIVE_DAILY_FOLDER_ID}`);
    console.log(`📁 Monthly backups folder: ${GDRIVE_MONTHLY_FOLDER_ID}`);
    console.log(`📊 Daily retention: ${MAX_DAILY_BACKUPS} files`);
    console.log(`📊 Monthly retention: ${MAX_MONTHLY_BACKUPS} files`);
    
    /**
     * DAILY BACKUP CRON JOB
     * Runs every day at 2:00 AM
     */
    cron.schedule("0 2 * * *", async () => {
      await performScheduledBackup(oAuth2Client, GDRIVE_DAILY_FOLDER_ID, MAX_DAILY_BACKUPS, "DAILY");
    });
    console.log("✅ Daily backup scheduler enabled (runs at 2:00 AM daily)");
    
    /**
     * MONTHLY BACKUP CRON JOB
     * Runs on 1st day of month at 2:00 AM
     */
    cron.schedule("0 2 1 * *", async () => {
      await performScheduledBackup(oAuth2Client, GDRIVE_MONTHLY_FOLDER_ID, MAX_MONTHLY_BACKUPS, "MONTHLY");
    });
    console.log("✅ Monthly backup scheduler enabled (runs at 2:00 AM on 1st day of month)");
    
    console.log("\n📋 Backup Schedule Summary:");
    console.log("   ┌─────────────────┬──────────────────┬─────────────┐");
    console.log("   │     Type        │     Schedule     │   Retention │");
    console.log("   ├─────────────────┼──────────────────┼─────────────┤");
    console.log("   │ Daily Backups   │ Every day 2:00 AM│ 31 files    │");
    console.log("   │ Monthly Backups │ 1st day 2:00 AM  │ 12 files    │");
    console.log("   └─────────────────┴──────────────────┴─────────────┘");

  } catch (error) {
    console.error("❌ Failed to initialize backup system:", error.message);
    console.log("⚠️  Backup system will not be available");
  }
}

// =============================================================================
// MAIN EXPRESS APPLICATION
// =============================================================================

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

// =============================================================================
// CRON JOBS FOR EMAIL NOTIFICATIONS
// =============================================================================

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

// =============================================================================
// START THE SERVER AND INITIALIZE SYSTEMS
// =============================================================================

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 TDMS Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  
  // Initialize the backup system
  initializeBackupSystem();
  
  console.log(`\n✅ All systems are now operational!`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down TDMS server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down TDMS server...');
  process.exit(0);
});