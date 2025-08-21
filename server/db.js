/**
 * db.js
 * 
 * Panglao Tourist Data Management System - Database Connection Utility
 * 
 * =========================
 * Overview:
 * =========================
 * This file manages the PostgreSQL connection pool for the Panglao TDMS backend application.
 * It centralizes all database connection logic, allowing other modules to perform queries using a shared pool instance.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Loads database configuration from environment variables using dotenv.
 * - Initializes and exports a PostgreSQL connection pool using the 'pg' library.
 * - Enables SSL connections automatically when running in production for enhanced security.
 * - Provides a single pool object for use throughout the application (controllers, models, etc.).
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses environment variables for flexible and secure configuration.
 * - Automatically detects production environment to enable SSL.
 * - Supports connection pooling for efficient database access and resource management.
 * - Designed for easy import and use in any part of the backend codebase.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Imported in models and controllers to execute SQL queries:
 *     const pool = require("../db");
 *     const result = await pool.query("SELECT * FROM users");
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - Ensure DATABASE_URL and NODE_ENV are set in the .env file.
 * - For production deployments, verify that SSL is supported and properly configured on your PostgreSQL server.
 * - Extend this file if you need to add custom pool event handlers or logging.
 * 
 * =========================
 * Related Files:
 * =========================
 * - .env                    (stores database connection string and environment variables)
 * - models/*                (uses the exported pool for database operations)
 * - controllers/*           (may use the pool directly for queries)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */
const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false, // Enable SSL only in production
});

module.exports = pool;