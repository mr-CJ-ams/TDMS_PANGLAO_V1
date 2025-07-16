const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// User management
router.get("/users", adminController.getUsers);
router.put("/approve/:id", adminController.approveUser);
router.put("/decline/:id", adminController.declineUser);
router.put("/deactivate/:id", adminController.deactivateUser);
router.put("/update-accommodation/:id", adminController.updateAccommodation);

// Submissions and metrics
router.get("/submissions", adminController.getSubmissions);
router.get("/monthly-checkins", adminController.getMonthlyCheckins);
router.get("/monthly-metrics", adminController.getMonthlyMetrics);
router.get("/nationality-counts", adminController.getNationalityCounts);
router.get("/nationality-counts-by-establishment", adminController.getNationalityCountsByEstablishment);
router.get("/guest-demographics", adminController.getGuestDemographics);

module.exports = router;

