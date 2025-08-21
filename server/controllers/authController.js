/**
 * authController.js
 * 
 * Panglao Tourist Data Management System - Authentication Controller
 * 
 * =========================
 * Overview:
 * =========================
 * This file contains all controller logic for user authentication and account management in the Panglao TDMS backend.
 * It serves as the main interface between HTTP requests (from routes/auth.js) and the database/model layer (models/userModel.js).
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - User Registration: Handles user signup, including email verification and auto-approval logic.
 * - User Login: Authenticates users and issues JWT tokens for session management.
 * - Profile Management: Allows users to update profile information, upload profile pictures, and update accommodation details.
 * - Password Management: Supports password reset via email, including secure token generation and validation.
 * - Email Verification: Manages the process of sending, verifying, and checking email verification tokens.
 * - User Retrieval: Provides endpoints for fetching authenticated user details.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses bcrypt for secure password hashing.
 * - Uses JWT for stateless authentication and session management.
 * - Integrates with email utilities for notifications and verification.
 * - Handles file uploads (profile pictures) using multer.
 * - All database access is delegated to userModel (models/userModel.js) for separation of concerns.
 * - Implements robust error handling and returns appropriate HTTP status codes and messages.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Called by routes defined in routes/auth.js (e.g., /auth/signup, /auth/login, /auth/forgot-password).
 * - Used by the frontend for user registration, login, profile management, and password recovery.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - All methods are asynchronous and should be used with Express async error handling.
 * - For new authentication features, add the controller logic here and expose it via routes/auth.js.
 * - For business logic/data access, use or extend models/userModel.js.
 * - For email notifications and verification, use the utilities in utils/email.js and utils/emailVerification.js.
 * 
 * =========================
 * Related Files:
 * =========================
 * - models/userModel.js         (database queries and business logic)
 * - routes/auth.js              (Express route definitions)
 * - middleware/auth.js          (JWT authentication middleware)
 * - utils/email.js              (email notification utility)
 * - utils/emailVerification.js  (email verification utility)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmailNotification } = require("../utils/email");
const userModel = require("../models/userModel");
const { getAutoApproval } = require("../utils/autoApproval");
const { generateVerificationToken, sendVerificationEmail, validateToken } = require("../utils/emailVerification");

const accommodationCodes = {
  Hotel: "HTL", Condotel: "CON", "Serviced Residence": "SER", Resort: "RES",
  Apartelle: "APA", Motel: "MOT", "Pension House": "PEN", "Home Stay Site": "HSS",
  "Tourist Inn": "TIN", Other: "OTH"
};

// Request email verification
exports.requestEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if email already exists and is verified
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser && existingUser.email_verified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    // Generate verification token
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await userModel.createEmailVerification(email, token, expiresAt);

    // Send verification email
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const emailSent = await sendVerificationEmail(email, token, baseUrl);

    if (emailSent) {
      res.json({ 
        success: true, 
        message: "Verification email sent successfully. Please check your inbox." 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: "Failed to send verification email. Please try again." 
      });
    }
  } catch (err) {
    console.error("Error requesting email verification:", err);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred while processing your request" 
    });
  }
};

// Verify email token
exports.verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.query;

    if (!email || !token) {
      return res.status(400).json({ success: false, message: "Email and token are required" });
    }

    if (!validateToken(token)) {
      return res.status(400).json({ success: false, message: "Invalid verification token" });
    }

    // Verify token
    const verification = await userModel.verifyEmailToken(email, token);
    if (!verification) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
    }

    // Mark email as verified
    await userModel.markEmailAsVerified(email);

    res.json({ 
      success: true, 
      message: "Email verified successfully! You can now complete your registration." 
    });
  } catch (err) {
    console.error("Error verifying email:", err);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred while verifying your email" 
    });
  }
};

// Check email verification status
exports.checkEmailVerification = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const isVerified = await userModel.isEmailVerified(email);
    res.json({ success: true, verified: isVerified });
  } catch (err) {
    console.error("Error checking email verification:", err);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred while checking verification status" 
    });
  }
};

// Modified signup to require email verification
exports.signup = async (req, res) => {
  try {
    const {
      email, password, phone_number, registered_owner, tin,
      company_name, company_address, accommodation_type, number_of_rooms,
      region, province, municipality, barangay, dateEstablished
    } = req.body;

    // Check if email is verified
    const isEmailVerified = await userModel.isEmailVerified(email);
    if (!isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "Please verify your email address before completing registration" 
      });
    }

    const accommodation_code = accommodationCodes[accommodation_type] || "OTH";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine approval state
    const is_approved = getAutoApproval();

    const user = await userModel.createUser({
      email, hashedPassword, phone_number, registered_owner, tin,
      company_name, company_address, accommodation_type, accommodation_code,
      number_of_rooms, region, province, municipality, barangay, dateEstablished,
      is_approved
    });

    // Send approval email if auto-approval is enabled
    if (is_approved) {
      const subject = "Your TDMS Account Has Been Approved";
      const message = `
        Dear Valued User,<br><br>
        We are pleased to inform you that your account registration for the Panglao Tourist Data Management System (TDMS) has been approved.<br><br>
        You may now log in and access the system using the following link:<br>
        <a href="https://tdms-panglao-client.onrender.com">Login Link</a><br><br>
        If you have any questions or require assistance, please do not hesitate to contact our office.<br><br>
        Thank you for your interest in the TDMS.<br><br>
        Best regards,<br>
        Panglao Tourism Office
      `;
      await sendEmailNotification(email, subject, message);
    }

    res.json({
      success: true,
      message: is_approved
        ? "Registration successful! You can now log in."
        : "Registration successful! Waiting for admin approval.",
      user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed. Please try again." 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(400).json("Invalid credentials");
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json("Invalid credentials");
    if (!user.is_approved) return res.status(400).json("Waiting for admin approval");
    if (!user.is_active) return res.status(400).json("Account is deactivated");
    const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.getUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findUserById(decoded.user_id);
    if (!user) return res.status(404).json("User not found");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const profilePictureUrl = `/uploads/${req.file.filename}`;
    await userModel.updateProfilePicture(decoded.user_id, profilePictureUrl);
    res.json({ profile_picture: profilePictureUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateRooms = async (req, res) => {
  try {
    const { number_of_rooms } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await userModel.updateNumberOfRooms(decoded.user_id, number_of_rooms);
    res.json({ message: "Number of rooms updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Email not found" });
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    await userModel.updateResetToken(email, resetToken, Date.now() + 3600000);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailSubject = "Password Reset Request";
    const emailMessage = `
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 1 hour.</p>
    `;
    sendEmailNotification(email, emailSubject, emailMessage);
    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to send reset link. Please try again later." });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: "Token and password are required" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findUserByResetToken(token);
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.updatePasswordAndClearReset(decoded.email, hashedPassword);
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password. Please try again later." });
  }
};