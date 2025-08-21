/**
 * autoApproval.js
 * 
 * Panglao Tourist Data Management System - Auto-Approval Utility
 * 
 * =========================
 * Overview:
 * =========================
 * This utility manages the auto-approval feature for new user registrations in the Panglao TDMS backend.
 * It provides functions to get and set the current auto-approval state, which determines whether new users are automatically approved or require manual admin approval.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Stores the current auto-approval state in memory, initialized from the AUTO_APPROVAL_ENABLED environment variable.
 * - Provides getter and setter functions for reading and updating the auto-approval state at runtime.
 * - Updates the process.env.AUTO_APPROVAL_ENABLED variable when the state is changed, allowing for runtime configuration changes.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Simple in-memory state management for the auto-approval flag.
 * - Allows toggling of auto-approval without restarting the server.
 * - Used by admin endpoints and registration logic to determine approval workflow.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Imported and used in adminController.js and routes/admin.js to allow admins to view or change the auto-approval setting.
 * - Used in user registration logic to determine if new users should be auto-approved.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The state is not persisted across server restarts; it is re-initialized from the environment variable each time the server starts.
 * - For persistent configuration, consider storing the setting in a database or configuration file.
 * - Extend this utility if more complex approval workflows are needed in the future.
 * 
 * =========================
 * Related Files:
 * =========================
 * - controllers/adminController.js   (calls getAutoApproval and setAutoApproval)
 * - routes/admin.js                  (defines endpoints for managing auto-approval)
 * - .env                             (stores initial AUTO_APPROVAL_ENABLED value)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */ 

let autoApprovalEnabled = process.env.AUTO_APPROVAL_ENABLED === 'true';

function getAutoApproval() {
  return autoApprovalEnabled;
}

function setAutoApproval(value) {
  autoApprovalEnabled = !!value;
  process.env.AUTO_APPROVAL_ENABLED = value ? 'true' : 'false';
}

module.exports = { getAutoApproval, setAutoApproval }; 