/**
 * auth.js (Middleware)
 * 
 * Panglao Tourist Data Management System - Authentication & Authorization Middleware
 * 
 * =========================
 * Overview:
 * =========================
 * This file provides middleware functions for handling authentication and authorization in the Panglao TDMS backend.
 * It is used to protect API endpoints by verifying JWT tokens and enforcing user roles (e.g., admin).
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Authentication: Verifies the presence and validity of JWT tokens in incoming requests.
 *   - Attaches the decoded user object to req.user if the token is valid.
 *   - Rejects requests with missing or invalid tokens.
 * - Authorization: Checks if the authenticated user has the required role (e.g., admin) to access certain endpoints.
 *   - Returns a 403 Forbidden error if the user lacks the necessary privileges.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Stateless authentication using JWT (JSON Web Tokens).
 * - Role-based access control for sensitive/admin routes.
 * - Designed for use as Express middleware (app.use or route-level).
 * - Centralizes authentication logic for maintainability and security.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in route definitions to protect endpoints:
 *     router.get("/admin-data", authenticateToken, requireAdmin, handler);
 *     router.post("/user-action", authenticateToken, handler);
 * - Ensures only authenticated users (and optionally, only admins) can access protected resources.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The JWT secret is read from process.env.JWT_SECRET.
 * - The decoded JWT payload is attached to req.user for downstream handlers.
 * - Extend this file to add more granular role checks or custom authorization logic as needed.
 * 
 * =========================
 * Related Files:
 * =========================
 * - routes/auth.js, routes/admin.js, routes/submissions.js (uses these middleware functions)
 * - controllers/* (expects req.user to be populated for authenticated requests)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

const jwt = require("jsonwebtoken");
require("dotenv").config({ path: require('path').resolve(__dirname, "../../.env") });

// Authentication: verifies JWT and attaches user to req
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Authorization: checks if user is admin
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin };