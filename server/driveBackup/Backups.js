/**
 * Backups.js
 * 
 * Automated Google Drive Backup Uploader for Panglao TDMS
 * 
 * Overview:
 * This script automates the process of uploading PostgreSQL backup files to Google Drive using OAuth2 authentication.
 * It supports two backup strategies:
 *   1. Daily Backup: Uploads the latest backup file to a specified Google Drive folder every day at 2:00 am.
 *      - Maintains a maximum number of daily backups (FIFO queue logic).
 *   2. Monthly Backup: Uploads the latest backup file to a different Google Drive folder every 1st day of the month at 2:00 am.
 *      - Maintains a maximum number of monthly backups (FIFO queue logic).
 * 
 * Key Features:
 * - Uses OAuth2 for secure, user-consented access to Google Drive.
 * - Automatically deletes the oldest backup file when the folder reaches its retention limit.
 * - Reads configuration (folder IDs, retention limits, credentials path) from environment variables for security and flexibility.
 * - Can be run as a persistent Node.js process (e.g., on a server or VM).
 * 
 * =========================
 * Step-by-Step Setup Guide:
 * =========================
 * 
 * 1. Enable Google Drive API and Create OAuth Credentials
 *    - Go to https://console.cloud.google.com/apis/credentials
 *    - Enable the Google Drive API for your project.
 *    - Click "Create Credentials" > "OAuth client ID" > "Desktop app".
 *    - Download the credentials JSON file and place it in /server/config.
 * 
 * 2. Install Required Packages
 *    - In your /server directory, run:
 *        npm install googleapis node-cron dotenv
 * 
 * 3. Configure Environment Variables
 *    - In your /server/.env file, add:
 *        GOOGLE_OAUTH_CREDENTIALS_PATH=./config/your_credentials_file.json
 *        GDRIVE_DAILY_FOLDER_ID=your_daily_folder_id
 *        GDRIVE_MONTHLY_FOLDER_ID=your_monthly_folder_id
 *        MAX_DAILY_BACKUPS=31
 *        MAX_MONTHLY_BACKUPS=12
 * 
 * 4. Authenticate and Generate token.json
 *    - Run this script once manually:
 *        node driveBackup/oauthDriveUpload.js
 *    - Follow the prompt: open the URL, log in, allow access, and paste the code.
 *    - This will create driveBackup/token.json for future automated runs.
 * 
 * 5. Place Your Backup Files
 *    - Ensure your PostgreSQL backup files (.dump) are placed in /server/backups.
 * 
 * 6. Run the Script for Automated Uploads
 *    - The script will automatically upload the latest backup to Google Drive at the scheduled times.
 *    - It will also manage retention by deleting the oldest backups if the folder exceeds the set limit.
 * 
 * 7. (Optional) Run Manually for Immediate Upload
 *    - You can invoke the upload logic manually for testing or on-demand backups.
 * 
 * 8. Troubleshooting
 *    - If you change credentials or revoke access, delete token.json and repeat step 4.
 *    - Ensure the Google account used has access to the target Drive folders.
 * 
 * Dependencies:
 * - googleapis
 * - node-cron
 * - dotenv (if using .env for environment variables)
 * 
 * Author: Carlojead Amaquin
 * Date: [2025-08-19]
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { google } = require("googleapis");
const cron = require("node-cron");
const { exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);

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
  const CREDENTIALS_PATH = path.resolve(__dirname, "../", process.env.GOOGLE_OAUTH_CREDENTIALS_PATH || "./config/client_secret.json");
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
  const TOKEN_PATH = path.join(__dirname, "token.json");
  console.log("🔑 Loading token from file:", TOKEN_PATH);
  
  if (fs.existsSync(TOKEN_PATH)) {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  }
  
  throw new Error("No OAuth token found. Please set GOOGLE_OAUTH_TOKEN_JSON environment variable.");
}

/**
 * Saves token to file (for local development only)
 */
function saveToken(token) {
  // Only save to file if we're not using environment variables
  if (!process.env.GOOGLE_OAUTH_TOKEN_JSON) {
    const TOKEN_PATH = path.join(__dirname, "token.json");
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
    console.log("💾 Token saved to file:", TOKEN_PATH);
  }
}

/**
 * Handles OAuth2 authentication.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, 
    client_secret, 
    redirect_uris ? redirect_uris[0] : 'http://localhost'
  );

  try {
    const token = loadToken();
    oAuth2Client.setCredentials(token);
    console.log("✅ OAuth token loaded successfully");
    callback(oAuth2Client);
  } catch (error) {
    console.log("❌ No valid token found:", error.message);
    if (process.env.NODE_ENV === 'production') {
      console.error("Cannot use interactive auth in production. Please provide a valid token via GOOGLE_OAUTH_TOKEN_JSON environment variable.");
      process.exit(1);
    } else {
      getAccessToken(oAuth2Client, callback);
    }
  }
}

/**
 * Prompts the user to authenticate via browser and saves the access token.
 * Only works in local development.
 */
function getAccessToken(oAuth2Client, callback) {
  if (process.env.NODE_ENV === 'production') {
    console.error("Interactive authentication not available in production.");
    console.error("Please provide a valid OAuth token via GOOGLE_OAUTH_TOKEN_JSON environment variable.");
    process.exit(1);
    return;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("🌐 Authorize this app by visiting this URL:\n", authUrl);
  process.stdout.write("Enter the code from that page here: ");
  
  process.stdin.once("data", (data) => {
    const code = data.toString().trim();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error("❌ Error retrieving access token:", err);
        process.exit(1);
        return;
      }
      oAuth2Client.setCredentials(token);
      saveToken(token);
      console.log("✅ Token stored successfully");
      callback(oAuth2Client);
    });
  });
}

/**
 * Creates a PostgreSQL database dump using pg_dump
 */
async function createDatabaseDump() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dumpFileName = `panglao_tdms_backup_${timestamp}.dump`;
  const dumpFilePath = path.join(__dirname, dumpFileName);
  
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

// Main execution
try {
  console.log("🚀 Initializing Automated Backup System...");
  console.log("📍 Environment:", process.env.NODE_ENV || 'development');
  
  // Load credentials and configuration
  const credentials = loadCredentials();
  const GDRIVE_DAILY_FOLDER_ID = process.env.GDRIVE_DAILY_FOLDER_ID;
  const GDRIVE_MONTHLY_FOLDER_ID = process.env.GDRIVE_MONTHLY_FOLDER_ID;
  const MAX_DAILY_BACKUPS = parseInt(process.env.MAX_DAILY_BACKUPS, 10) || 31;
  const MAX_MONTHLY_BACKUPS = parseInt(process.env.MAX_MONTHLY_BACKUPS, 10) || 12;

  // Validate required environment variables
  if (!GDRIVE_DAILY_FOLDER_ID || !GDRIVE_MONTHLY_FOLDER_ID) {
    throw new Error("Missing required environment variables: GDRIVE_DAILY_FOLDER_ID and GDRIVE_MONTHLY_FOLDER_ID");
  }

  // Main authorization and scheduling logic
  authorize(credentials, (auth) => {
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
      await performScheduledBackup(auth, GDRIVE_DAILY_FOLDER_ID, MAX_DAILY_BACKUPS, "DAILY");
    });
    console.log("✅ Daily backup scheduler enabled (runs at 2:00 AM daily)");
    
    /**
     * MONTHLY BACKUP CRON JOB
     * Runs on 1st day of month at 2:00 AM
     */
    cron.schedule("0 2 1 * *", async () => {
      await performScheduledBackup(auth, GDRIVE_MONTHLY_FOLDER_ID, MAX_MONTHLY_BACKUPS, "MONTHLY");
    });
    console.log("✅ Monthly backup scheduler enabled (runs at 2:00 AM on 1st day of month)");
    
    console.log("\n📋 Backup Schedule Summary:");
    console.log("   ┌─────────────────┬──────────────────┬─────────────┐");
    console.log("   │     Type        │     Schedule     │   Retention │");
    console.log("   ├─────────────────┼──────────────────┼─────────────┤");
    console.log("   │ Daily Backups   │ Every day 2:00 AM│ 31 files    │");
    console.log("   │ Monthly Backups │ 1st day 2:00 AM  │ 12 files    │");
    console.log("   └─────────────────┴──────────────────┴─────────────┘");
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down backup system...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, shutting down backup system...');
      process.exit(0);
    });
  });

} catch (error) {
  console.error("❌ Failed to initialize backup system:", error.message);
  console.log("\n🔧 Setup Instructions for Render.com:");
  console.log("1. Set GOOGLE_OAUTH_CREDENTIALS_JSON environment variable with your credentials JSON");
  console.log("2. Set GOOGLE_OAUTH_TOKEN_JSON environment variable with your token JSON");
  console.log("3. Ensure DATABASE_URL is set to your PostgreSQL connection string");
  console.log("4. Set GDRIVE_DAILY_FOLDER_ID and GDRIVE_MONTHLY_FOLDER_ID");
  process.exit(1);
}

// =============================================================================
// HTTP Server for Render.com Port Binding
// =============================================================================
const http = require('http');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Only respond to GET requests
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    const healthResponse = {
      status: 'Backup system is running',
      service: 'Automated Google Drive Backup',
      environment: process.env.NODE_ENV || 'development',
      schedules: {
        daily: 'Every day at 2:00 AM',
        monthly: '1st day of month at 2:00 AM'
      },
      retention: {
        daily: process.env.MAX_DAILY_BACKUPS || 31,
        monthly: process.env.MAX_MONTHLY_BACKUPS || 12
      },
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())} seconds`
    };
    
    res.end(JSON.stringify(healthResponse, null, 2));
  } else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🌐 HTTP Server started on port ${PORT}`);
  console.log(`🔍 Health check available at: http://localhost:${PORT}`);
  console.log(`✅ Backup system is now fully operational!`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ HTTP Server error:', error.message);
});