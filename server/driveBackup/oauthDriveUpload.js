/**
 * oauthDriveUpload.js
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
 * Usage:
 * 1. Ensure you have a valid OAuth2 credentials JSON file and have authenticated at least once (token.json).
 * 2. Set the required environment variables in your .env file:
 *      - GOOGLE_OAUTH_CREDENTIALS_PATH
 *      - GDRIVE_DAILY_FOLDER_ID
 *      - GDRIVE_MONTHLY_FOLDER_ID
 *      - MAX_DAILY_BACKUPS
 *      - MAX_MONTHLY_BACKUPS
 * 3. Place your backup files in the /backups directory.
 * 4. Run this script with Node.js.
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
require("dotenv").config({ path: path.join(__dirname, "../.env") }); // <-- Move here
const { google } = require("googleapis");
const cron = require("node-cron"); // For scheduling backup uploads

// Google Drive API scope for file access
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Paths for OAuth2 token and credentials
const TOKEN_PATH = path.join(__dirname, "token.json");
const CREDENTIALS_PATH = path.resolve(__dirname, "../", process.env.GOOGLE_OAUTH_CREDENTIALS_PATH);

/**
 * Loads OAuth2 credentials from the credentials JSON file.
 * @returns {Object} Parsed credentials object.
 */
function loadCredentials() {
  return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
}

/**
 * Handles OAuth2 authentication.
 * If token.json exists, uses the saved token.
 * Otherwise, prompts the user to authenticate and saves the token.
 * @param {Object} credentials - OAuth2 credentials.
 * @param {Function} callback - Function to call with authenticated client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));
    callback(oAuth2Client);
  } else {
    getAccessToken(oAuth2Client, callback);
  }
}

/**
 * Prompts the user to authenticate via browser and saves the access token.
 * @param {OAuth2Client} oAuth2Client - OAuth2 client.
 * @param {Function} callback - Function to call with authenticated client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:\n", authUrl);
  process.stdout.write("Enter the code from that page here: ");
  process.stdin.once("data", (data) => {
    const code = data.toString().trim();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log("Token stored to", TOKEN_PATH);
      callback(oAuth2Client);
    });
  });
}

/**
 * Uploads a file to Google Drive in the specified folder.
 * @param {OAuth2Client} auth - Authenticated OAuth2 client.
 * @param {string} filePath - Local path to the file.
 * @param {string} fileName - Name to use in Google Drive.
 * @param {string} folderId - Google Drive folder ID.
 * @returns {Object|null} Uploaded file metadata or null on error.
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
      fields: "id, name, webViewLink, createdTime",
    });
    console.log("File uploaded:", res.data);
    return res.data;
  } catch (err) {
    console.error("Error uploading file:", err);
    return null;
  }
}

/**
 * Lists backup files in a specific Google Drive folder.
 * Filters by file name and sorts by creation time.
 * @param {OAuth2Client} auth - Authenticated OAuth2 client.
 * @param {string} folderId - Google Drive folder ID.
 * @returns {Array} List of file metadata objects.
 */
async function listBackupFiles(auth, folderId) {
  const drive = google.drive({ version: "v3", auth });
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and name contains 'panglao_tdms_backup_' and trashed = false`,
      fields: "files(id, name, createdTime)",
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
 * @param {OAuth2Client} auth - Authenticated OAuth2 client.
 * @param {string} fileId - Google Drive file ID.
 */
async function deleteFile(auth, fileId) {
  const drive = google.drive({ version: "v3", auth });
  try {
    await drive.files.delete({ fileId });
    console.log("Deleted old backup file:", fileId);
  } catch (err) {
    console.error("Error deleting file:", err);
  }
}

// Load credentials and set up backup directory and configuration from environment variables
const credentials = loadCredentials();
const BACKUP_DIR = path.join(__dirname, "../backups");
const GDRIVE_DAILY_FOLDER_ID = process.env.GDRIVE_DAILY_FOLDER_ID;
const MAX_DAILY_BACKUPS = parseInt(process.env.MAX_DAILY_BACKUPS, 10) || 31;

// Main authorization and scheduling logic
authorize(credentials, (auth) => {
  /**
   * Daily Backup Cron Job
   * Runs every day at 2:00 am.
   * - Uploads the latest backup file to the daily Google Drive folder.
   * - Maintains a maximum number of daily backups (FIFO: deletes oldest if limit reached).
   */
  cron.schedule("0 2 * * *", async () => {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".dump"));
    if (files.length === 0) {
      console.log("No backup file found in", BACKUP_DIR);
      return;
    }
    // Get the latest backup file (by name, assuming naming is chronological)
    const latestFile = files.sort().reverse()[0];
    const filePath = path.join(BACKUP_DIR, latestFile);

    // List current backup files in the daily folder
    const backupFiles = await listBackupFiles(auth, GDRIVE_DAILY_FOLDER_ID);

    // If at max retention, delete the oldest file (FIFO)
    if (backupFiles.length >= MAX_DAILY_BACKUPS) {
      backupFiles.sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime));
      const oldest = backupFiles[0];
      await deleteFile(auth, oldest.id);
    }

    // Upload the latest backup file
    await uploadFile(auth, filePath, latestFile, GDRIVE_DAILY_FOLDER_ID);
  });

  /**
   * Monthly Backup Cron Job
   * Runs every 1st day of the month at 2:00 am.
   * - Uploads the latest backup file to the monthly Google Drive folder.
   * - Maintains a maximum number of monthly backups (FIFO: deletes oldest if limit reached).
   */
  const GDRIVE_MONTHLY_FOLDER_ID = process.env.GDRIVE_MONTHLY_FOLDER_ID;
  const MAX_MONTHLY_BACKUPS = parseInt(process.env.MAX_MONTHLY_BACKUPS, 10) || 12;

  cron.schedule("0 2 1 * *", async () => {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".dump"));
    if (files.length === 0) {
      console.log("No backup file found in", BACKUP_DIR);
      return;
    }
    // Get the latest backup file (by name, assuming naming is chronological)
    const latestFile = files.sort().reverse()[0];
    const filePath = path.join(BACKUP_DIR, latestFile);

    // List current backup files in the monthly folder
    const backupFiles = await listBackupFiles(auth, GDRIVE_MONTHLY_FOLDER_ID);

    // If at max retention, delete the oldest file (FIFO)
    if (backupFiles.length >= MAX_MONTHLY_BACKUPS) {
      backupFiles.sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime));
      const oldest = backupFiles[0];
      await deleteFile(auth, oldest.id);
    }

    // Upload the latest backup file
    await uploadFile(auth, filePath, latestFile, GDRIVE_MONTHLY_FOLDER_ID);
    console.log("Monthly backup uploaded to GDrive.");
  });
});