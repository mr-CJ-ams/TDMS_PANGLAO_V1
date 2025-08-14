const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Auth routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/user", authenticateToken, authController.getUser);
router.post("/upload-profile-picture", authenticateToken, upload.single("profile_picture"), authController.uploadProfilePicture);
router.put("/update-rooms", authenticateToken, authController.updateRooms);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Email verification routes
router.post("/request-email-verification", authController.requestEmailVerification);
router.get("/verify-email", authController.verifyEmail);
router.get("/check-email-verification", authController.checkEmailVerification);

module.exports = router;
