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

// Submit a new submission
router.post("/submit", submissionsController.submit);

// Get submission history for a user
router.get("/history/:userId", submissionsController.history);

// Get details of a specific submission
router.get("/details/:submissionId", submissionsController.details);

// Update penalty status for a submission
router.put("/penalty/:submissionId", submissionsController.updatePenalty);

// Delete a submission
router.delete("/:submissionId", submissionsController.deleteSubmission);

// Check if user has submitted for a month/year
router.get("/check-submission", submissionsController.checkSubmission);

// Get a specific submission for a user/month/year
router.get("/:userId/:month/:year", submissionsController.getSubmission);

// --- Draft management endpoints ---

// Save a draft submission
router.post("/draft", submissionsController.saveDraft);

// Get a draft for a user/month/year
router.get("/draft/:userId/:month/:year", submissionsController.getDraft);

// Delete a draft for a user/month/year
router.delete("/draft/:userId/:month/:year", submissionsController.deleteDraft);

// Get all drafts
router.get("/drafts", submissionsController.getAllDrafts);

// Get details of a specific draft
router.get("/draft/:draftId", submissionsController.getDraftDetails);

module.exports = router;