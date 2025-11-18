/**
 * adminModel.js
 * 
 * Panglao Tourist Data Management System - Admin Model
 * 
 * =========================
 * Overview:
 * =========================
 * This file defines the AdminModel class, which contains all database query logic and business rules for admin-related operations in the Panglao TDMS backend.
 * It serves as the data access layer for the adminController.js, encapsulating all SQL queries and transactional logic related to users, submissions, and analytics.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - User Management: Query, approve, decline, deactivate users, and update accommodation types and codes.
 * - Submission Management: Retrieve, filter, and paginate submissions for admin review and reporting.
 * - Analytics & Statistics: Provide aggregated data for monthly check-ins, metrics, nationality counts, guest demographics, and more.
 * - Data Integrity: Implements transactional logic for critical updates (e.g., user deactivation).
 * 
 * =========================
 * Key Features:
 * =========================
 * - All methods are static and asynchronous, returning query results or processed data.
 * - Uses parameterized SQL queries to prevent SQL injection.
 * - Handles complex filtering, searching, and aggregation for analytics endpoints.
 * - Designed for separation of concerns: all business/data logic is kept out of controllers.
 * - Returns data in formats ready for use by controllers and API responses.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Called by adminController.js for all admin-related backend operations.
 * - Used by the admin dashboard frontend to display and manage users, submissions, and analytics.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - Extend this class to add new admin-related queries or business logic.
 * - For new analytics or reporting features, add methods here and expose them via the controller.
 * - Use transactions (BEGIN/COMMIT/ROLLBACK) for multi-step or critical updates.
 * - All methods should return plain JavaScript objects or arrays for easy consumption.
 * 
 * =========================
 * Related Files:
 * =========================
 * - controllers/adminController.js   (calls these methods for API endpoints)
 * - routes/admin.js                  (defines Express routes for admin endpoints)
 * - db.js                            (database connection pool)
 * 
* =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

const pool = require("../db");

class AdminModel {
  // User related methods
  static async getUsers(adminUserId = null) {
  let query = `
    SELECT * FROM users 
    WHERE role = 'user' 
    AND phone_number IS NOT NULL 
    AND registered_owner IS NOT NULL
    AND company_name IS NOT NULL
    AND accommodation_type IS NOT NULL
  `;
  
  const params = [];
  
  // If adminUserId is provided, filter by admin's location
  if (adminUserId) {
    // Get admin's location details
    const adminResult = await pool.query(
      `SELECT region, province, municipality FROM users WHERE user_id = $1`,
      [adminUserId]
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      
      // Add location filters to the query
      query += ` AND region = $${params.length + 1}`;
      params.push(admin.region);
      
      query += ` AND province = $${params.length + 1}`;
      params.push(admin.province);
      
      query += ` AND municipality = $${params.length + 1}`;
      params.push(admin.municipality);
    }
  }
  
  const result = await pool.query(query, params);
  return result.rows;
}

  static async approveUser(id) {
    await pool.query("UPDATE users SET is_approved = true WHERE user_id = $1", [id]);
    const user = await pool.query("SELECT email FROM users WHERE user_id = $1", [id]);
    return user.rows[0].email;
  }

  static async declineUser(id) {
    const user = await pool.query("SELECT email FROM users WHERE user_id = $1", [id]);
    await pool.query("DELETE FROM users WHERE user_id = $1", [id]);
    return user.rows[0].email;
  }

  static async deactivateUser(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const userExists = await client.query("SELECT * FROM users WHERE user_id = $1", [id]);
      if (userExists.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }
      await client.query("UPDATE users SET is_active = FALSE WHERE user_id = $1", [id]);
      await client.query("COMMIT");
      return true;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async updateAccommodation(id, accommodation_type) {
    const accommodationCodes = {
      Hotel: "HTL", Condotel: "CON", "Serviced Residence": "SER", Resort: "RES",
      Apartelle: "APA", Motel: "MOT", "Pension House": "PEN", "Home Stay Site": "HSS",
      "Tourist Inn": "TIN", Other: "OTH"
    };
    const accommodation_code = accommodationCodes[accommodation_type] || "OTH";
    await pool.query(
      `UPDATE users SET accommodation_type = $1, accommodation_code = $2 WHERE user_id = $3`,
      [accommodation_type, accommodation_code, id]
    );
    return true;
  }

  static async getUserEmailById(id) {
    const user = await pool.query("SELECT email FROM users WHERE user_id = $1", [id]);
    return user.rows.length > 0 ? user.rows[0].email : null;
  }

  // Submission related methods
static async getSubmissions({ month, year, status, penaltyStatus, search }, { limit, offset }, adminUserId = null) {
  let query = `
    SELECT s.submission_id, s.user_id, s.month, s.year, 
           s.submitted_at, s.is_late, s.penalty, s.deadline,
           s.average_guest_nights, s.average_room_occupancy_rate, s.average_guests_per_room,
           s.receipt_number,
           u.company_name, u.accommodation_type, u.region, u.province, u.municipality
    FROM submissions s
    JOIN users u ON s.user_id = u.user_id
  `;
  const filters = [];
  const params = [];
  
  // If adminUserId is provided, filter by admin's location
  if (adminUserId) {
    // Get admin's location details
    const adminResult = await pool.query(
      `SELECT region, province, municipality FROM users WHERE user_id = $1`,
      [adminUserId]
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      
      // Add location filters to the query
      query += ` WHERE u.region = $${params.length + 1}`;
      params.push(admin.region);
      
      query += ` AND u.province = $${params.length + 1}`;
      params.push(admin.province);
      
      query += ` AND u.municipality = $${params.length + 1}`;
      params.push(admin.municipality);
    }
  } else {
    // If no adminUserId, start with WHERE clause for other filters
    query += ` WHERE 1=1`;
  }
  
  // Add other filters
  if (month) { 
    filters.push(`s.month = $${params.length + 1}`); 
    params.push(month); 
  }
  if (year) { 
    filters.push(`s.year = $${params.length + 1}`); 
    params.push(year); 
  }
  if (status) {
    if (status === "Late") filters.push(`s.is_late = true`);
    else if (status === "On-Time") filters.push(`s.is_late = false`);
  }
  if (penaltyStatus) {
    if (penaltyStatus === "Paid") filters.push(`s.penalty = true`);
    else if (penaltyStatus === "Unpaid") filters.push(`s.penalty = false`);
  }
  if (search) {
    filters.push(`u.company_name ILIKE $${params.length + 1}`);
    params.push(`%${search}%`);
  }

  // Add the filters to the query
  if (filters.length > 0) {
    query += adminUserId ? ` AND ${filters.join(" AND ")}` : ` AND ${filters.join(" AND ")}`;
  }

  query += `
    ORDER BY s.submitted_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  params.push(limit, offset);

  const submissions = await pool.query(query, params);
  
  let countQuery = `
    SELECT COUNT(*) 
    FROM submissions s
    JOIN users u ON s.user_id = u.user_id
  `;
  
  // Add the same location filter to count query
  if (adminUserId) {
    countQuery += ` WHERE u.region = $1 AND u.province = $2 AND u.municipality = $3`;
    const adminResult = await pool.query(
      `SELECT region, province, municipality FROM users WHERE user_id = $1`,
      [adminUserId]
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      const countParams = [admin.region, admin.province, admin.municipality];
      
      // Add other filters to count query
      if (filters.length > 0) {
        countQuery += ` AND ${filters.join(" AND ")}`;
        // Add filter values to countParams
        filters.forEach((filter, index) => {
          if (filter.includes("month")) countParams.push(month);
          if (filter.includes("year")) countParams.push(year);
          if (filter.includes("company_name")) countParams.push(`%${search}%`);
        });
      }
      
      const totalCount = await pool.query(countQuery, countParams);
      return {
        submissions: submissions.rows,
        total: parseInt(totalCount.rows[0].count)
      };
    }
  }
  
  // Fallback if no admin location found
  if (filters.length > 0) {
    countQuery += ` WHERE ${filters.join(" AND ")}`;
  }
  
  const totalCount = await pool.query(countQuery, params.slice(0, -2));
  
  return {
    submissions: submissions.rows,
    total: parseInt(totalCount.rows[0].count)
  };
}

  // Analytics related methods
static async getMonthlyCheckins(year, adminUserId = null) {
  let query = `
    SELECT s.month, SUM(dm.check_ins) AS total_check_ins
    FROM submissions s
    JOIN daily_metrics dm ON s.submission_id = dm.submission_id
    JOIN users u ON s.user_id = u.user_id
    WHERE s.year = $1
  `;
  
  const params = [year];
  
  // Add location filtering if adminUserId is provided
  if (adminUserId) {
    const adminResult = await pool.query(
      `SELECT region, province, municipality FROM users WHERE user_id = $1`,
      [adminUserId]
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      query += ` AND u.region = $${params.length + 1}`;
      params.push(admin.region);
      
      query += ` AND u.province = $${params.length + 1}`;
      params.push(admin.province);
      
      query += ` AND u.municipality = $${params.length + 1}`;
      params.push(admin.municipality);
    }
  }
  
  query += ` GROUP BY s.month ORDER BY s.month ASC`;
  
  const result = await pool.query(query, params);
  return result.rows;
}

static async getMonthlyMetrics(year, adminUserId = null) {
  let baseQuery = `
    WITH monthly_metrics AS (
      SELECT 
        s.month,
        SUM(dm.check_ins) AS total_check_ins,
        SUM(dm.overnight) AS total_overnight,
        SUM(dm.occupied) AS total_occupied,
        AVG(s.average_guest_nights) AS average_guest_nights,
        AVG(s.average_room_occupancy_rate) AS average_room_occupancy_rate,
        AVG(s.average_guests_per_room) AS average_guests_per_room,
        COUNT(DISTINCT s.submission_id) AS total_submissions
      FROM submissions s
      LEFT JOIN daily_metrics dm ON s.submission_id = dm.submission_id
      JOIN users u ON s.user_id = u.user_id
      WHERE s.year = $1
  `;
  
  const params = [year];
  
  // Add location filtering if adminUserId is provided
  if (adminUserId) {
    const adminResult = await pool.query(
      `SELECT region, province, municipality FROM users WHERE user_id = $1`,
      [adminUserId]
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      baseQuery += ` AND u.region = $${params.length + 1}`;
      params.push(admin.region);
      
      baseQuery += ` AND u.province = $${params.length + 1}`;
      params.push(admin.province);
      
      baseQuery += ` AND u.municipality = $${params.length + 1}`;
      params.push(admin.municipality);
    }
  }
  
  baseQuery += `
      GROUP BY s.month
    ),
    total_rooms AS (
      SELECT
        s.month,
        SUM(s.number_of_rooms) AS total_rooms
      FROM submissions s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.year = $1
  `;
  
  // Add same location filtering to total_rooms CTE
  if (adminUserId) {
    const adminResult = await pool.query(
      `SELECT region, province, municipality FROM users WHERE user_id = $1`,
      [adminUserId]
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      baseQuery += ` AND u.region = $${params.length + 1}`;
      params.push(admin.region);
      
      baseQuery += ` AND u.province = $${params.length + 1}`;
      params.push(admin.province);
      
      baseQuery += ` AND u.municipality = $${params.length + 1}`;
      params.push(admin.municipality);
    }
  }
  
  baseQuery += `
      GROUP BY s.month
    )
    SELECT 
      m.month,
      m.total_check_ins,
      m.total_overnight,
      m.total_occupied,
      m.average_guest_nights,
      m.average_room_occupancy_rate,
      m.average_guests_per_room,
      m.total_submissions,
      COALESCE(t.total_rooms, 0) AS total_rooms
    FROM monthly_metrics m
    LEFT JOIN total_rooms t ON m.month = t.month
    ORDER BY m.month ASC;
  `;
  
  const result = await pool.query(baseQuery, params);
  
  // Count only approved users in the same location for submission rate calculation
  let usersCountQuery = `
    SELECT COUNT(*) FROM users 
    WHERE role = 'user' AND is_approved = true
  `;
  
  const usersCountParams = [];
  
  if (adminUserId) {
    const adminResult = await pool.query(
      `SELECT region, province, municipality FROM users WHERE user_id = $1`,
      [adminUserId]
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      usersCountQuery += ` AND region = $${usersCountParams.length + 1}`;
      usersCountParams.push(admin.region);
      
      usersCountQuery += ` AND province = $${usersCountParams.length + 1}`;
      usersCountParams.push(admin.province);
      
      usersCountQuery += ` AND municipality = $${usersCountParams.length + 1}`;
      usersCountParams.push(admin.municipality);
    }
  }
  
  const usersCount = await pool.query(usersCountQuery, usersCountParams);
  
  return {
    metrics: result.rows,
    totalUsers: usersCount.rows[0].count
  };
}

static async getNationalityCounts(year, month, adminUserId = null) {
  let query = `
    SELECT 
      g.nationality, 
      COUNT(*) AS count,
      SUM(CASE WHEN g.gender = 'Male' THEN 1 ELSE 0 END) AS male_count,
      SUM(CASE WHEN g.gender = 'Female' THEN 1 ELSE 0 END) AS female_count
    FROM guests g
    JOIN daily_metrics dm ON g.metric_id = dm.metric_id
    JOIN submissions s ON dm.submission_id = s.submission_id
    JOIN users u ON s.user_id = u.user_id
    WHERE s.year = $1 AND s.month = $2 AND g.is_check_in = true
  `;
  
  const params = [year, month];
  
  // Add location filtering if adminUserId is provided
  if (adminUserId) {
    const adminResult = await pool.query(
      `SELECT region, province, municipality FROM users WHERE user_id = $1`,
      [adminUserId]
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      query += ` AND u.region = $${params.length + 1}`;
      params.push(admin.region);
      
      query += ` AND u.province = $${params.length + 1}`;
      params.push(admin.province);
      
      query += ` AND u.municipality = $${params.length + 1}`;
      params.push(admin.municipality);
    }
  }
  
  query += ` GROUP BY g.nationality ORDER BY count DESC`;
  
  const result = await pool.query(query, params);
  return result.rows;
}

static async getNationalityCountsByEstablishment(year, month, adminUserId = null) {
  let query = `
    SELECT 
      u.company_name AS establishment,
      g.nationality, 
      COUNT(*) AS count
    FROM guests g
    JOIN daily_metrics dm ON g.metric_id = dm.metric_id
    JOIN submissions s ON dm.submission_id = s.submission_id
    JOIN users u ON s.user_id = u.user_id
    WHERE s.year = $1 AND s.month = $2 AND g.is_check_in = true
  `;
  
  const params = [year, month];
  
  // Add location filtering if adminUserId is provided
  if (adminUserId) {
    const adminResult = await pool.query(
      `SELECT region, province, municipality FROM users WHERE user_id = $1`,
      [adminUserId]
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      query += ` AND u.region = $${params.length + 1}`;
      params.push(admin.region);
      
      query += ` AND u.province = $${params.length + 1}`;
      params.push(admin.province);
      
      query += ` AND u.municipality = $${params.length + 1}`;
      params.push(admin.municipality);
    }
  }
  
  query += ` GROUP BY u.company_name, g.nationality ORDER BY u.company_name ASC, g.nationality ASC`;
  
  const result = await pool.query(query, params);
  return result.rows;
}

static async getGuestDemographics(year, month, adminUserId = null) {
  let query = `
    SELECT 
      g.gender,
      CASE
        WHEN g.age BETWEEN 0 AND 12 THEN 'Children'
        WHEN g.age BETWEEN 13 AND 17 THEN 'Teens'
        WHEN g.age BETWEEN 18 AND 24 THEN 'Young Adults'
        WHEN g.age BETWEEN 25 AND 44 THEN 'Adults'
        WHEN g.age BETWEEN 45 AND 59 THEN 'Middle-Aged'
        WHEN g.age >= 60 THEN 'Seniors'
        ELSE 'Unknown'
      END AS age_group,
      g.status,
      COUNT(*) AS count
    FROM guests g
    JOIN daily_metrics dm ON g.metric_id = dm.metric_id
    JOIN submissions s ON dm.submission_id = s.submission_id
    JOIN users u ON s.user_id = u.user_id
    WHERE s.year = $1 AND s.month = $2 AND g.is_check_in = true
  `;
  
  const params = [year, month];
  
  // Add location filtering if adminUserId is provided
  if (adminUserId) {
    const adminResult = await pool.query(
      `SELECT region, province, municipality FROM users WHERE user_id = $1`,
      [adminUserId]
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      query += ` AND u.region = $${params.length + 1}`;
      params.push(admin.region);
      
      query += ` AND u.province = $${params.length + 1}`;
      params.push(admin.province);
      
      query += ` AND u.municipality = $${params.length + 1}`;
      params.push(admin.municipality);
    }
  }
  
  query += ` GROUP BY g.gender, age_group, g.status ORDER BY g.gender, age_group, g.status`;
  
  const result = await pool.query(query, params);
  return result.rows;
}

static async getVerifiedEmails() {
  // Select verified emails that do not exist in users table OR exist but haven't completed registration
  const result = await pool.query(`
    SELECT ev.email
    FROM email_verifications ev
    WHERE ev.verified = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM users u 
        WHERE u.email = ev.email 
        AND u.phone_number IS NOT NULL 
        AND u.registered_owner IS NOT NULL
        AND u.company_name IS NOT NULL
      )
  `);
  return result.rows;
}
}

module.exports = AdminModel;