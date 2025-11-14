/**
 * submissionModel.js
 * 
 * Panglao Tourist Data Management System - Submission Model
 * 
 * =========================
 * Overview:
 * =========================
 * This file defines the SubmissionModel class, which contains all database query logic and business rules for accommodation submissions and related data in the Panglao TDMS backend.
 * It serves as the data access layer for submissionsController.js, encapsulating all SQL queries and transactional logic related to submissions, drafts, metrics, guests, and user statistics.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Submission Management: Create, retrieve, update, and delete monthly accommodation submissions.
 * - Daily Metrics & Guests: Manage daily metrics and guest records associated with each submission.
 * - Draft Management: Save, retrieve, update, and delete draft submissions for in-progress reports.
 * - Analytics & Statistics: Provide user-specific statistics, monthly metrics, guest demographics, and nationality counts.
 * - Penalty Management: Update penalty status and receipt numbers for late or incomplete submissions.
 * - Stay Management: Remove specific stays across all months for a user.
 * 
 * =========================
 * Key Features:
 * =========================
 * - All methods are static and asynchronous, returning query results or processed data.
 * - Uses parameterized SQL queries to prevent SQL injection.
 * - Handles complex data aggregation and transformation for analytics endpoints.
 * - Implements transactional logic for multi-step operations (e.g., submission creation, deletion).
 * - Designed for separation of concerns: all business/data logic is kept out of controllers.
 * - Returns data in formats ready for use by controllers and API responses.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Called by submissionsController.js for all submission-related backend operations.
 * - Used by both user and admin dashboards for managing and analyzing accommodation submissions and drafts.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - Extend this class to add new submission-related queries or business logic.
 * - For new analytics or reporting features, add methods here and expose them via the controller.
 * - Use transactions (BEGIN/COMMIT/ROLLBACK) for multi-step or critical updates.
 * - All methods should return plain JavaScript objects or arrays for easy consumption.
 * 
 * =========================
 * Related Files:
 * =========================
 * - controllers/submissionsController.js   (calls these methods for API endpoints)
 * - routes/submissions.js                  (defines Express routes for submission endpoints)
 * - db.js                                  (database connection pool)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

const pool = require("../db");

class SubmissionModel {
  // Helper function to calculate the deadline using native Date
  static calculateDeadline(month, year) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return new Date(Date.UTC(nextYear, nextMonth - 1, 10, 23, 59, 59));
  }

  // Helper function to get current time in Philippines
  static getPhilippinesTime() {
    const phTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
    return new Date(phTime);
  }

  static async getUserRoomCount(userId) {
    const result = await pool.query(
      "SELECT number_of_rooms FROM users WHERE user_id = $1",
      [userId]
    );
    return result.rows[0].number_of_rooms;
  }

  static async createSubmission(client, submissionData) {
    const {
      user_id, month, year, deadline, currentTime, isLate, penaltyAmount,
      averageGuestNights, averageRoomOccupancyRate, averageGuestsPerRoom, numberOfRooms
    } = submissionData;

    const result = await client.query(
      `INSERT INTO submissions 
       (user_id, month, year, deadline, submitted_at, is_late, penalty_amount,
        average_guest_nights, average_room_occupancy_rate, average_guests_per_room, number_of_rooms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING submission_id`,
      [
        user_id, month, year, deadline.toISOString(), currentTime.toISOString(),
        isLate, penaltyAmount, averageGuestNights, averageRoomOccupancyRate,
        averageGuestsPerRoom, numberOfRooms
      ]
    );
    return result.rows[0].submission_id;
  }

  static async createDailyMetric(client, submissionId, dayData) {
    const result = await client.query(
      `INSERT INTO daily_metrics 
       (submission_id, day, check_ins, overnight, occupied)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING metric_id`,
      [submissionId, dayData.day, dayData.checkIns, dayData.overnight, dayData.occupied]
    );
    return result.rows[0].metric_id;
  }

  static async createGuest(client, metricId, guest) {
    await client.query(
      `INSERT INTO guests 
       (metric_id, room_number, gender, age, status, nationality, is_check_in)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        metricId,
        guest.roomNumber,
        guest.gender,
        guest.age,
        guest.status,
        guest.nationality,
        guest.isCheckIn,
      ]
    );
  }

  static async getSubmissionHistory(userId) {
    const result = await pool.query(
      `SELECT s.submission_id, s.month, s.year, s.submitted_at, s.is_late, s.penalty,
              s.average_guest_nights, s.average_room_occupancy_rate, s.average_guests_per_room,
              s.receipt_number, s.user_id, u.company_name
       FROM submissions s
       LEFT JOIN users u ON s.user_id = u.user_id
       WHERE s.user_id = $1
       ORDER BY s.submitted_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getUserStatistics(userId) {
    const result = await pool.query(
      `SELECT 
         s.month,
         s.year,
         SUM(dm.check_ins) as total_check_ins
       FROM submissions s
       LEFT JOIN daily_metrics dm ON s.submission_id = dm.submission_id
       WHERE s.user_id = $1
       GROUP BY s.month, s.year
       ORDER BY s.year ASC, s.month ASC`,
      [userId]
    );
    return result.rows;
  }

  static async getUserMonthlyMetrics(userId, year) {
    const result = await pool.query(
      `SELECT 
         s.month,
         s.year,
         SUM(dm.check_ins) as total_check_ins,
         SUM(dm.overnight) as total_overnight,
         SUM(dm.occupied) as total_occupied,
         AVG(s.average_guest_nights) as average_guest_nights,
         AVG(s.average_room_occupancy_rate) as average_room_occupancy_rate,
         AVG(s.average_guests_per_room) as average_guests_per_room,
         AVG(s.number_of_rooms) as total_rooms
       FROM submissions s
       LEFT JOIN daily_metrics dm ON s.submission_id = dm.submission_id
       WHERE s.user_id = $1 AND s.year = $2
       GROUP BY s.month, s.year
       ORDER BY s.month ASC`,
      [userId, year]
    );
    return result.rows;
  }

  static async getSubmissionDetails(submissionId) {
    const result = await pool.query(
      `SELECT s.submission_id, s.month, s.year, s.submitted_at, s.is_late, s.penalty,
              s.average_guest_nights, s.average_room_occupancy_rate, s.average_guests_per_room,
              s.number_of_rooms, u.company_name, u.accommodation_type,
              COALESCE(json_agg(json_build_object(
                'day', dm.day,
                'check_ins', dm.check_ins,
                'overnight', dm.overnight,
                'occupied', dm.occupied,
                'guests', COALESCE((SELECT json_agg(json_build_object(
                  'room_number', g.room_number,
                  'gender', g.gender,
                  'age', g.age,
                  'status', g.status,
                  'nationality', g.nationality,
                  'isCheckIn', g.is_check_in
                )) FROM guests g WHERE g.metric_id = dm.metric_id), '[]'::json)
              )) FILTER (WHERE dm.metric_id IS NOT NULL), '[]'::json) AS days
       FROM submissions s
       LEFT JOIN users u ON s.user_id = u.user_id
       LEFT JOIN daily_metrics dm ON s.submission_id = dm.submission_id
       WHERE s.submission_id = $1
       GROUP BY s.submission_id, u.company_name, u.accommodation_type`,
      [submissionId]
    );
    return result.rows[0];
  }

  static async updatePenaltyStatus(submissionId, penalty, receipt_number) {
    await pool.query(
      "UPDATE submissions SET penalty = $1, receipt_number = $2 WHERE submission_id = $3",
      [penalty, receipt_number, submissionId]
    );
  }

  static async deleteSubmission(client, submissionId) {
    await client.query(
      `DELETE FROM guests
       WHERE metric_id IN (
         SELECT metric_id FROM daily_metrics WHERE submission_id = $1
       )`,
      [submissionId]
    );
    await client.query(
      `DELETE FROM daily_metrics WHERE submission_id = $1`,
      [submissionId]
    );
    await client.query(
      `DELETE FROM submissions WHERE submission_id = $1`,
      [submissionId]
    );
  }

  static async checkSubmissionExists(userId, month, year) {
    const result = await pool.query(
      `SELECT * FROM submissions WHERE user_id = $1 AND month = $2 AND year = $3`,
      [userId, month, year]
    );
    return result.rows.length > 0;
  }

  static async getSubmissionByDate(userId, month, year) {
    const result = await pool.query(
      `SELECT * FROM submissions WHERE user_id = $1 AND month = $2 AND year = $3`,
      [userId, month, year]
    );
    return result.rows[0] || null;
  }

  // Draft related methods
  static async saveDraft(client, userId, month, year, data) {
    const cleanData = data.map(item => ({
      day: Number(item.day) || 0,
      room: Number(item.room) || 0,
      guests: Array.isArray(item.guests) ? item.guests.map(guest => ({
        gender: String(guest.gender || ''),
        age: Number(guest.age) || 0,
        status: String(guest.status || ''),
        nationality: String(guest.nationality || ''),
        isCheckIn: Boolean(guest.isCheckIn),
        _isStartDay: guest._isStartDay ?? false,
        _stayId: guest._stayId ?? '',
        _startDay: guest._startDay ?? 0,
        _startMonth: guest._startMonth ?? 0,
        _startYear: guest._startYear ?? 0,
      })) : [],
      lengthOfStay: Number(item.lengthOfStay) || 0,
      isCheckIn: Boolean(item.isCheckIn),
      stayId: String(item.stayId || ''),
      startDay: Number(item.startDay) || 0,
      startMonth: Number(item.startMonth) || 0,
      startYear: Number(item.startYear) || 0,
      isStartDay: Boolean(item.isStartDay)
    }));

    await client.query(
      `INSERT INTO draft_submissions (user_id, month, year, data)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (user_id, month, year) 
       DO UPDATE SET data = $4::jsonb, last_updated = CURRENT_TIMESTAMP`,
      [userId, month, year, JSON.stringify(cleanData)]
    );
  }

  static async getDraft(userId, month, year) {
    const result = await pool.query(
      `SELECT data FROM draft_submissions 
       WHERE user_id = $1 AND month = $2 AND year = $3`,
      [userId, month, year]
    );
    return result.rows[0]?.data || [];
  }

  static async deleteDraft(userId, month, year) {
    await pool.query(
      `DELETE FROM draft_submissions 
       WHERE user_id = $1 AND month = $2 AND year = $3`,
      [userId, month, year]
    );
  }

  static async getAllDrafts() {
    const result = await pool.query(
      `SELECT 
         ds.draft_id, ds.user_id, ds.month, ds.year, 
         ds.last_updated, u.company_name
       FROM draft_submissions ds
       JOIN users u ON ds.user_id = u.user_id
       ORDER BY ds.last_updated DESC`
    );
    return result.rows;
  }

  static async getDraftDetails(draftId) {
    const result = await pool.query(
      `SELECT 
         ds.data, ds.month, ds.year,
         u.company_name, u.number_of_rooms
       FROM draft_submissions ds
       JOIN users u ON ds.user_id = u.user_id
       WHERE ds.draft_id = $1`,
      [draftId]
    );
    return result.rows[0];
  }

  static async getUserGuestDemographics(userId, year, month) {
    const result = await pool.query(
      `SELECT
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
          COUNT(*) as count
        FROM submissions s
        JOIN daily_metrics dm ON s.submission_id = dm.submission_id
        JOIN guests g ON dm.metric_id = g.metric_id
        WHERE s.user_id = $1 AND s.year = $2 AND s.month = $3 AND g.is_check_in = true
        GROUP BY g.gender, age_group, g.status
        ORDER BY g.gender, age_group, g.status`,
      [userId, year, month]
    );
    return result.rows;
  }

  static async getUserNationalityCounts(userId, year, month) {
    const result = await pool.query(
      `SELECT
          g.nationality,
          COUNT(*) as count,
          SUM(CASE WHEN g.gender = 'Male' THEN 1 ELSE 0 END) as male_count,
          SUM(CASE WHEN g.gender = 'Female' THEN 1 ELSE 0 END) as female_count
        FROM submissions s
        JOIN daily_metrics dm ON s.submission_id = dm.submission_id
        JOIN guests g ON dm.metric_id = g.metric_id
        WHERE s.user_id = $1 AND s.year = $2 AND s.month = $3 AND g.is_check_in = true
        GROUP BY g.nationality
        ORDER BY count DESC, g.nationality ASC`,
      [userId, year, month]
    );
    return result.rows;
  }

  static async getAllDraftsForUser(userId) {
    const result = await pool.query(
      `SELECT month, year, data 
       FROM draft_submissions 
       WHERE user_id = $1
       ORDER BY year ASC, month ASC`,
      [userId]
    );

    return result.rows.map(row => ({
      month: row.month,
      year: row.year,
      data: row.data,
    }));
  }
}
// Export the pool along with the class
module.exports = {
  SubmissionModel,
  pool
};