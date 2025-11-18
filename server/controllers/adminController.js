/**
 * adminController.js
 * 
 * Panglao Tourist Data Management System - Admin Controller
 * 
 * =========================
 * Overview:
 * =========================
 * This file contains all controller logic for admin-related operations in the Panglao TDMS backend.
 * It acts as the main interface between HTTP requests (from routes/admin.js) and the database/model layer (models/adminModel.js).
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - User Management: Approve, decline, deactivate users, update accommodation types, and fetch user lists.
 * - Submission Management: Retrieve, filter, and paginate submissions for admin review and reporting.
 * - Analytics & Statistics: Provide endpoints for monthly check-ins, metrics, nationality counts, guest demographics, and more.
 * - Auto-Approval: Get and set the system's auto-approval feature for new user registrations.
 * - Notification: Integrates with the email utility to send notifications on user status changes.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Each exported function is an Express route handler, designed for use with async/await.
 * - All database access is delegated to the AdminModel (models/adminModel.js) for separation of concerns.
 * - Uses middleware for authentication and admin authorization (see middleware/auth.js).
 * - Handles errors gracefully and returns appropriate HTTP status codes and messages.
 * - Supports filtering, searching, and pagination for large data sets.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Called by routes defined in routes/admin.js (e.g., /admin/users, /admin/monthly-checkins).
 * - Used by the admin dashboard frontend to display and manage users, submissions, and analytics.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - All methods are asynchronous and should be used with Express async error handling.
 * - For new admin features, add the controller logic here and expose it via routes/admin.js.
 * - For business logic/data access, use or extend models/adminModel.js.
 * - For email notifications, use the sendEmailNotification utility.
 * 
 * =========================
 * Related Files:
 * =========================
 * - models/adminModel.js      (database queries and business logic)
 * - routes/admin.js           (Express route definitions)
 * - middleware/auth.js        (JWT authentication and admin authorization)
 * - utils/email.js            (email notification utility)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

const AdminModel = require("../models/adminModel");
const { sendEmailNotification } = require("../utils/email");

// Get all users with role 'user'
exports.getUsers = async (req, res) => {
  try {
    // Get the admin user ID from the authenticated user
    const adminUserId = req.user.user_id;
    const allUsers = await AdminModel.getUsers(adminUserId);
    res.json(allUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Approve User
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await AdminModel.getUserEmailById(id);
    if (!email) return res.status(404).json({ success: false, message: "User email not found." });

    const subject = "Your TDMS Account Has Been Approved";
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const message = `
      Dear Valued User,<br><br>
      We are pleased to inform you that your account registration for the Panglao Tourist Data Management System (TDMS) has been approved.<br><br>
      You may now log in and access the system using the following link:<br>
      <a href="${loginUrl}">Login Link</a><br><br>
      If you have any questions or require assistance, please do not hesitate to contact our office.<br><br>
      Thank you for your interest in the TDMS.<br><br>
      Best regards,<br>
      Panglao Municipal Tourism Office
    `;
    await sendEmailNotification(email, subject, message);
    await AdminModel.approveUser(id);
    res.json({ success: true, message: "User approved and email sent successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Failed to send email. User not approved." });
  }
};

// Decline User
exports.declineUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { message: declineMessage } = req.body;
    const email = await AdminModel.getUserEmailById(id);
    if (!email) return res.status(404).json({ success: false, message: "User email not found." });

    const subject = "Your TDMS Account Application Status";
    const message = `
      Dear Applicant,<br><br>
      We regret to inform you that your registration for the Panglao Tourist Data Management System (TDMS) has not been approved.<br><br>
      <strong>Reason for decline:</strong> ${declineMessage}<br><br>
      If you believe this decision was made in error or if you have any questions, please contact our office for further clarification.<br><br>
      Thank you for your interest in the TDMS.<br><br>
      Sincerely,<br>
      Panglao Municipal Tourism Office
    `;
    await sendEmailNotification(email, subject, message);
    await AdminModel.declineUser(id);
    res.json({ success: true, message: "User declined and email sent successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Failed to send email. User not declined." });
  }
};

// Deactivate User
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AdminModel.deactivateUser(id);
    
    if (result === null) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deactivated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Accommodation Type
exports.updateAccommodation = async (req, res) => {
  try {
    const { id } = req.params;
    const { accommodation_type } = req.body;
    
    await AdminModel.updateAccommodation(id, accommodation_type);
    res.json({ message: "Accommodation type updated successfully" });
  } catch (err) {
    console.error("Error updating accommodation type:", err);
    res.status(500).json({ error: "Failed to update accommodation type" });
  }
};

// Get submissions with filters, pagination, and search
exports.getSubmissions = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, month, year, status, penaltyStatus, search,
    } = req.query;
    const offset = (page - 1) * limit;
    
    // Get the admin user ID from the authenticated user
    const adminUserId = req.user.user_id;
    
    const { submissions, total } = await AdminModel.getSubmissions(
      { month, year, status, penaltyStatus, search },
      { limit, offset },
      adminUserId  // Pass admin user ID for location filtering
    );
    
    res.json({
      submissions,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("Submissions error:", err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

// Monthly Check-ins
// In server/controllers/adminController.js - Update analytics endpoints

// Monthly Check-ins
exports.getMonthlyCheckins = async (req, res) => {
  try {
    const { year } = req.query;
    const adminUserId = req.user.user_id; // Get admin user ID
    const result = await AdminModel.getMonthlyCheckins(year, adminUserId);
    res.json(result);
  } catch (err) {
    console.error("Error fetching monthly check-ins:", err);
    res.status(500).json({ error: "Failed to fetch monthly check-ins" });
  }
};

// Monthly Metrics
exports.getMonthlyMetrics = async (req, res) => {
  try {
    const { year } = req.query;
    const adminUserId = req.user.user_id; // Get admin user ID
    const { metrics, totalUsers } = await AdminModel.getMonthlyMetrics(year, adminUserId);
    
    const metricsWithSubmissionRate = metrics.map((row) => ({
      ...row,
      submission_rate: totalUsers > 0 ? ((row.total_submissions / totalUsers) * 100).toFixed(2) : 0,
    }));
    
    res.json(metricsWithSubmissionRate);
  } catch (err) {
    console.error("Error fetching monthly metrics:", err);
    res.status(500).json({ error: "Failed to fetch monthly metrics" });
  }
};

// Nationality Counts
exports.getNationalityCounts = async (req, res) => {
  try {
    const { year, month } = req.query;
    const adminUserId = req.user.user_id; // Get admin user ID
    const result = await AdminModel.getNationalityCounts(year, month, adminUserId);
    res.json(result);
  } catch (err) {
    console.error("Error fetching nationality counts:", err);
    res.status(500).json({ error: "Failed to fetch nationality counts" });
  }
};

// Nationality Counts by Establishment
exports.getNationalityCountsByEstablishment = async (req, res) => {
  try {
    const { year, month } = req.query;
    const adminUserId = req.user.user_id; // Get admin user ID
    const result = await AdminModel.getNationalityCountsByEstablishment(year, month, adminUserId);
    res.json(result);
  } catch (err) {
    console.error("Error fetching nationality counts by establishment:", err);
    res.status(500).json({ error: "Failed to fetch nationality counts by establishment" });
  }
};

// Guest Demographics
exports.getGuestDemographics = async (req, res) => {
  try {
    const { year, month } = req.query;
    const adminUserId = req.user.user_id; // Get admin user ID
    const result = await AdminModel.getGuestDemographics(year, month, adminUserId);
    res.json(result);
  } catch (err) {
    console.error("Error fetching guest demographics:", err);
    res.status(500).json({ error: "Failed to fetch guest demographics" });
  }
};

// Get Verified Emails
exports.getVerifiedEmails = async (req, res) => {
  try {
    const result = await AdminModel.getVerifiedEmails();
    res.json(result);
  } catch (err) {
    console.error("Error fetching verified emails:", err);
    res.status(500).json({ error: "Failed to fetch verified emails" });
  }
};