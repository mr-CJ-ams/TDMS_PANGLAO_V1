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
const path = require("path");
const { Pool } = require("pg");

// ensure .env from project root is loaded when this module is required
require("dotenv").config({ 
  path: path.join(__dirname, "..", ".env"),
  override: true  // FORCE .env to win over system variables
});

// treat SSL as required only in production or when explicitly requested
const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.PGSSLMODE === "require" ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("sslmode=require"));

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 100,  // INCREASE from 200 to 300 for 1000 users
  min: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,  // INCREASE from 2000
  statement_timeout: 30000,
  application_name: 'tdms_app'
};

if (isProduction) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

// quick startup test/log so errors are visible immediately
(async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection error:", err.message || err);
  }
})();

// Add connection monitoring
pool.on('error', (err) => {
  console.error('❌ Unexpected idle client error:', err);
});

pool.on('connect', () => {
  console.log('✅ New connection established');
});

module.exports = pool;