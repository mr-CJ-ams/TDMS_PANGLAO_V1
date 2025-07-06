/**
 * db.js
 * 
 * Purpose: Manages the PostgreSQL connection pool for the application.
 * - Loads configuration from environment variables using dotenv.
 * - Enables SSL in production for secure connections.
 * - Exports a pool object for querying the database throughout the app.
 * 
 * Environment Variables:
 * - DATABASE_URL: Connection string for the PostgreSQL database.
 * - NODE_ENV: Set to 'production' to enable SSL.
 */
const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false, // Enable SSL only in production
});

module.exports = pool;