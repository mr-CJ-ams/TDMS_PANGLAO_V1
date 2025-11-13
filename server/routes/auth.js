/**
 * auth.js (Routes)
 * 
 * Panglao Tourist Data Management System - Authentication & User API Routes
 * 
 * =========================
 * Overview:
 * =========================
 * This file defines all Express routes for user authentication, registration, profile management, and email verification in the Panglao TDMS backend.
 * It acts as the main entry point for HTTP requests targeting authentication and user account functionality, connecting endpoints to controller logic in authController.js.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - User Registration & Login: Endpoints for user signup and login, issuing JWT tokens for session management.
 * - Profile Management: Endpoints for retrieving user info, uploading profile pictures, and updating accommodation details (e.g., number of rooms).
 * - Password Management: Endpoints for initiating and completing password reset flows.
 * - Email Verification: Endpoints for requesting, verifying, and checking email verification status.
 * - File Uploads: Uses multer middleware to handle profile picture uploads securely.
 * - Access Control: Applies authentication middleware to protect user-specific endpoints.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses Express Router for modular route definitions.
 * - Integrates authentication middleware (authenticateToken) to protect sensitive endpoints.
 * - Delegates business logic to authController.js and utility functions.
 * - Supports multipart/form-data for profile picture uploads.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Imported and used in server/index.js as part of the main Express app.
 * - Consumed by the frontend for user registration, login, profile management, password recovery, and email verification.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - For new authentication or user features, add route definitions here and implement logic in authController.js.
 * - Use appropriate middleware to restrict access to authenticated users.
 * - Ensure file uploads are handled securely and stored in the correct location.
 * 
 * =========================
 * Related Files:
 * =========================
 * - controllers/authController.js   (handles business logic for each route)
 * - middleware/auth.js              (provides authentication middleware)
 * - utils/email.js                  (handles email notifications)
 * - utils/emailVerification.js      (handles email verification logic)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */ 

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authController = require("../controllers/authController");
const submissionsController = require("../controllers/submissionsController");
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

// GET room names
router.get('/user/:userId/room-names', authenticateToken, submissionsController.getRoomNames);

// POST/PUT room names
router.post('/user/:userId/room-names', authenticateToken, submissionsController.saveRoomNames);

module.exports = router;
