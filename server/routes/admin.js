const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { getAutoApproval, setAutoApproval } = require("../utils/autoApproval");

// User management
router.get("/users", adminController.getUsers);
router.put("/approve/:id", adminController.approveUser);
router.put("/decline/:id", adminController.declineUser);
router.put("/deactivate/:id", adminController.deactivateUser);
router.put("/update-accommodation/:id", adminController.updateAccommodation);

// Auto-approval endpoints
router.get("/auto-approval", (req, res) => {
  res.json({ enabled: getAutoApproval() });
});

router.post("/auto-approval", (req, res) => {
  // TODO: Add admin authentication/authorization here
  setAutoApproval(!!req.body.enabled);
  res.json({ enabled: getAutoApproval() });
});

// Submissions and metrics
router.get("/submissions", adminController.getSubmissions);
router.get("/monthly-checkins", adminController.getMonthlyCheckins);
router.get("/monthly-metrics", adminController.getMonthlyMetrics);
router.get("/nationality-counts", adminController.getNationalityCounts);
router.get("/nationality-counts-by-establishment", adminController.getNationalityCountsByEstablishment);
router.get("/guest-demographics", adminController.getGuestDemographics);

module.exports = router;

