const express = require("express");
const router = express.Router();
const submissionsController = require("../controllers/submissionsController");

// Submit a new submission
router.post("/submit", submissionsController.submit);

// Submission history
router.get("/history/:userId", submissionsController.history);

// Submission details
router.get("/details/:submissionId", submissionsController.details);

// Update penalty status
router.put("/penalty/:submissionId", submissionsController.updatePenalty);

// Delete a submission
router.delete("/:submissionId", submissionsController.deleteSubmission);

// Check if user has submitted for a month/year
router.get("/check-submission", submissionsController.checkSubmission);

// Get a specific submission
router.get("/:userId/:month/:year", submissionsController.getSubmission);

// Draft endpoints
router.post("/draft", submissionsController.saveDraft);
router.get("/draft/:userId/:month/:year", submissionsController.getDraft);
router.delete("/draft/:userId/:month/:year", submissionsController.deleteDraft);
router.get("/drafts", submissionsController.getAllDrafts);
router.get("/draft/:draftId", submissionsController.getDraftDetails);

module.exports = router;

