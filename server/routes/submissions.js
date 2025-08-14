/**
 * submissions.js
 * 
 * Purpose: Defines API routes for managing submissions in the application.
 * - Handles creating, viewing, updating, and deleting submissions.
 * - Manages submission drafts and penalty status.
 * - Connects HTTP endpoints to controller logic in submissionsController.
 * 
 * Endpoints:
 * - POST   /submit                : Submit a new submission
 * - GET    /history/:userId       : Get submission history for a user
 * - GET    /details/:submissionId : Get details of a specific submission
 * - PUT    /penalty/:submissionId : Update penalty status for a submission
 * - DELETE /:submissionId         : Delete a submission
 * - GET    /check-submission      : Check if user has submitted for a month/year
 * - GET    /:userId/:month/:year  : Get a specific submission
 * - Draft management endpoints (save, get, delete, list drafts)
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