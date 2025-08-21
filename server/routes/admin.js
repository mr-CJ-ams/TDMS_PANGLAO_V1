/**
 * admin.js (Routes)
 * 
 * Panglao Tourist Data Management System - Admin API Routes
 * 
 * =========================
 * Overview:
 * =========================
 * This file defines all Express routes for admin-related operations in the Panglao TDMS backend.
 * It acts as the main entry point for HTTP requests targeting admin functionality, connecting endpoints to controller logic in adminController.js.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - User Management: Endpoints for listing users, approving, declining, deactivating users, and updating accommodation types.
 * - Auto-Approval: Endpoints to get and set the system's auto-approval feature for new user registrations.
 * - Submission & Analytics: Endpoints for retrieving submissions, monthly check-ins, metrics, nationality counts, and guest demographics.
 * - Access Control: Applies authentication and admin authorization middleware to protect sensitive endpoints.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses Express Router for modular route definitions.
 * - Integrates authentication (authenticateToken) and role-based authorization (requireAdmin) middleware.
 * - Delegates business logic to adminController.js and utility functions.
 * - Supports both admin-only and shared (admin/user) analytics endpoints.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Imported and used in server/index.js as part of the main Express app.
 * - Consumed by the admin dashboard frontend for user management, analytics, and reporting features.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - For new admin features, add route definitions here and implement logic in adminController.js.
 * - Use appropriate middleware to restrict access (e.g., requireAdmin for admin-only endpoints).
 * - For analytics endpoints shared with users, only use authenticateToken.
 * 
 * =========================
 * Related Files:
 * =========================
 * - controllers/adminController.js   (handles business logic for each route)
 * - middleware/auth.js               (provides authentication and authorization middleware)
 * - utils/autoApproval.js            (handles auto-approval feature logic)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { getAutoApproval, setAutoApproval } = require("../utils/autoApproval");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// User management
router.get("/users", authenticateToken, requireAdmin, adminController.getUsers);
router.put("/approve/:id", authenticateToken, requireAdmin, adminController.approveUser);
router.put("/decline/:id", authenticateToken, requireAdmin, adminController.declineUser);
router.put("/deactivate/:id", authenticateToken, requireAdmin, adminController.deactivateUser);
router.put("/update-accommodation/:id", authenticateToken, requireAdmin, adminController.updateAccommodation);

// Auto-approval endpoints
router.get("/auto-approval", authenticateToken, requireAdmin, (req, res) => {
  res.json({ enabled: getAutoApproval() });
});
router.post("/auto-approval", authenticateToken, requireAdmin, (req, res) => {
  setAutoApproval(!!req.body.enabled);
  res.json({ enabled: getAutoApproval() });
});

// Submissions and metrics
router.get("/submissions", authenticateToken, requireAdmin, adminController.getSubmissions);
router.get("/monthly-checkins", authenticateToken, adminController.getMonthlyCheckins);
router.get("/monthly-metrics", authenticateToken, adminController.getMonthlyMetrics);
router.get("/nationality-counts", authenticateToken, adminController.getNationalityCounts);
router.get("/nationality-counts-by-establishment", authenticateToken, requireAdmin, adminController.getNationalityCountsByEstablishment);
router.get("/guest-demographics", authenticateToken, adminController.getGuestDemographics);

module.exports = router;

