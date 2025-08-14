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
router.get("/monthly-checkins", authenticateToken, requireAdmin, adminController.getMonthlyCheckins);
router.get("/monthly-metrics", authenticateToken, requireAdmin, adminController.getMonthlyMetrics);
router.get("/nationality-counts", authenticateToken, requireAdmin, adminController.getNationalityCounts);
router.get("/nationality-counts-by-establishment", authenticateToken, requireAdmin, adminController.getNationalityCountsByEstablishment);
router.get("/guest-demographics", authenticateToken, requireAdmin, adminController.getGuestDemographics);

module.exports = router;

