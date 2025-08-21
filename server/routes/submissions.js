/**
 * submissions.js (Routes)
 * 
 * Panglao Tourist Data Management System - Submissions API Routes
 * 
 * =========================
 * Overview:
 * =========================
 * This file defines all Express routes for managing accommodation submissions, drafts, metrics, and related analytics in the Panglao TDMS backend.
 * It acts as the main entry point for HTTP requests targeting submission functionality, connecting endpoints to controller logic in submissionsController.js.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Submission Management: Endpoints for creating, viewing, updating, and deleting accommodation submissions.
 * - Draft Management: Endpoints for saving, retrieving, updating, and deleting draft submissions.
 * - Analytics & Statistics: Endpoints for retrieving user statistics, monthly metrics, guest demographics, and nationality counts.
 * - Penalty Management: Endpoints for updating penalty status and removing stays.
 * - Access Control: Applies authentication middleware to protect user-specific endpoints and admin authorization for sensitive actions.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses Express Router for modular route definitions.
 * - Integrates authentication (authenticateToken) and admin authorization (requireAdmin) middleware.
 * - Delegates business logic to submissionsController.js and utility functions.
 * - Supports both user and admin dashboard features for submission management and analytics.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Imported and used in server/index.js as part of the main Express app.
 * - Consumed by both user and admin frontends for submission, draft, and analytics features.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - For new submission or analytics features, add route definitions here and implement logic in submissionsController.js.
 * - Use appropriate middleware to restrict access to authenticated users and admins as needed.
 * - Ensure endpoints are RESTful and follow consistent naming conventions.
 * 
 * =========================
 * Related Files:
 * =========================
 * - controllers/submissionsController.js   (handles business logic for each route)
 * - middleware/auth.js                     (provides authentication and authorization middleware)
 * - models/submissionModel.js              (handles database queries and business logic)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

const express = require("express");
const router = express.Router();
const submissionsController = require("../controllers/submissionsController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Submit a new submission
router.post("/submit", authenticateToken, submissionsController.submit);

// Get submission history for a user
router.get("/history/:userId", authenticateToken, submissionsController.history);

// Get user statistics for charts
router.get("/statistics/:userId", authenticateToken, submissionsController.getUserStatistics);

// Get user monthly metrics for detailed table
router.get("/metrics/:userId", authenticateToken, submissionsController.getUserMonthlyMetrics);

// Get details of a specific submission
router.get("/details/:submissionId", authenticateToken, submissionsController.details);

// Update penalty status for a submission
router.put("/penalty/:submissionId", authenticateToken, requireAdmin, submissionsController.updatePenalty);

// Delete a submission
router.delete("/:submissionId", authenticateToken, submissionsController.deleteSubmission);

// Check if user has submitted for a month/year
router.get("/check-submission", authenticateToken, submissionsController.checkSubmission);

// Get a specific submission for a user/month/year
router.get("/:userId/:month/:year", authenticateToken, submissionsController.getSubmission);

// Get guest demographics for a user, year, and month
router.get("/guest-demographics/:userId", authenticateToken, submissionsController.getUserGuestDemographics);

// Get nationality counts for a user, year, and month
router.get("/nationality-counts/:userId", authenticateToken, submissionsController.getUserNationalityCounts);

// --- Draft management endpoints ---

// Save a draft submission
router.post("/draft", authenticateToken, submissionsController.saveDraft);

// Get a draft for a user/month/year
router.get("/draft/:userId/:month/:year", authenticateToken, submissionsController.getDraft);

// Delete a draft for a user/month/year
router.delete("/draft/:userId/:month/:year", authenticateToken, submissionsController.deleteDraft);

// Get all drafts
router.get("/drafts", authenticateToken, submissionsController.getAllDrafts);

// Get details of a specific draft
router.get("/draft/:draftId", authenticateToken, submissionsController.getDraftDetails);

// Remove a stay from all months for a user
router.delete("/stay/:userId/:stayId", authenticateToken, submissionsController.removeStayFromAllMonths);

module.exports = router;