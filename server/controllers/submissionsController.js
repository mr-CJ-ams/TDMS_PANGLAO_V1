/**
 * submissionsController.js
 * 
 * Panglao Tourist Data Management System - Submissions Controller
 * 
 * =========================
 * Overview:
 * =========================
 * This file contains all controller logic for managing accommodation submissions and related data in the Panglao TDMS backend.
 * It acts as the main interface between HTTP requests (from routes/submissions.js) and the database/model layer (models/submissionModel.js).
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Submission Management: Handles creation, retrieval, updating, and deletion of monthly accommodation submissions.
 * - Draft Management: Supports saving, retrieving, updating, and deleting draft submissions for in-progress reports.
 * - Analytics & Statistics: Provides endpoints for user-specific statistics, monthly metrics, guest demographics, and nationality counts.
 * - Penalty Management: Allows admins to update penalty status for late or incomplete submissions.
 * - Stay Management: Supports removal of specific stays across all months for a user.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Each exported function is an Express route handler, designed for use with async/await.
 * - All database access is delegated to SubmissionModel (models/submissionModel.js) for separation of concerns.
 * - Uses middleware for authentication and (where needed) admin authorization (see middleware/auth.js).
 * - Handles errors gracefully and returns appropriate HTTP status codes and messages.
 * - Supports filtering, searching, and pagination for large data sets.
 * - Implements transactional logic for multi-step operations (e.g., submission creation, deletion).
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Called by routes defined in routes/submissions.js (e.g., /submissions/submit, /submissions/history/:userId).
 * - Used by both user and admin dashboards for managing and analyzing accommodation submissions.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - All methods are asynchronous and should be used with Express async error handling.
 * - For new submission features, add the controller logic here and expose it via routes/submissions.js.
 * - For business logic/data access, use or extend models/submissionModel.js.
 * - For analytics/statistics, ensure queries are optimized for performance.
 * 
 * =========================
 * Related Files:
 * =========================
 * - models/submissionModel.js    (database queries and business logic)
 * - routes/submissions.js        (Express route definitions)
 * - middleware/auth.js           (JWT authentication and admin authorization)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-19]
 */

require("dotenv").config({ path: require('path').resolve(__dirname, "../../.env") });

const { SubmissionModel, pool } = require("../models/submissionModel");
exports.submit = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, month, year, days } = req.body;
    if (!user_id || !month || !year || !Array.isArray(days)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Pre-check duplicate submission
    const check = await pool.query(
      'SELECT submission_id FROM submissions WHERE user_id=$1 AND month=$2 AND year=$3 LIMIT 1',
      [user_id, month, year]
    );
    if (check.rows.length > 0) {
      return res.status(409).json({ error: 'Submission already exists for this month' });
    }

    // compute totals & rates (read-only, outside tx)
    let totalCheckIns = 0, totalOvernight = 0, totalOccupied = 0;
    for (const d of days) {
      totalCheckIns += Number(d.checkIns || 0);
      totalOvernight += Number(d.overnight || 0);
      totalOccupied += Number(d.occupied || 0);
    }
    const numberOfRooms = await SubmissionModel.getUserRoomCount(user_id);
    const averageGuestNights = totalCheckIns ? (totalOvernight / totalCheckIns).toFixed(2) : 0;
    const averageRoomOccupancyRate = numberOfRooms ? ((totalOccupied / (numberOfRooms * days.length)) * 100).toFixed(2) : 0;
    const averageGuestsPerRoom = totalOccupied ? (totalOvernight / totalOccupied).toFixed(2) : 0;

    const MAX_ATTEMPTS = 3;
    let attempt = 0;
    let submissionId;

    while (attempt < MAX_ATTEMPTS) {
      attempt++;
      try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

        // create submission
        // Compute deadline / current time and penalty BEFORE creating the submission
        const deadline = SubmissionModel.calculateDeadline(month, year);
        const currentTime = SubmissionModel.getPhilippinesTime();
        const isLate = currentTime > deadline;
        const penaltyAmount = isLate ? 1500 : 0;

        // Fetch room names from users table (fallback to default room names)
        const roomNamesRes = await pool.query("SELECT room_names FROM users WHERE user_id = $1", [user_id]);
        const roomNames = roomNamesRes.rows[0]?.room_names || Array.from({ length: numberOfRooms }, (_, i) => `Room ${i + 1}`);

        // create submission - createSubmission returns the submission_id (number)
        submissionId = await SubmissionModel.createSubmission(client, {
          user_id, month, year, deadline, currentTime, isLate, penaltyAmount,
          averageGuestNights, averageRoomOccupancyRate, averageGuestsPerRoom, numberOfRooms, roomNames
        });

        // Insert daily metrics (parameterized)
        const dmValues = [];
        const dmPlaceholders = [];
        let idx = 1;
        for (const d of days) {
          dmValues.push(submissionId, Number(d.day || 0), Number(d.checkIns || 0), Number(d.overnight || 0), Number(d.occupied || 0));
          dmPlaceholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
        }

        let dayToMetricId = new Map();
        if (dmPlaceholders.length > 0) {
          const dmRes = await client.query(
            `INSERT INTO daily_metrics (submission_id, day, check_ins, overnight, occupied)
             VALUES ${dmPlaceholders.join(', ')}
             RETURNING metric_id, day`,
            dmValues
          );
          dmRes.rows.forEach(r => dayToMetricId.set(Number(r.day), r.metric_id));
        }

        // Insert guests parameterized by metric_id
        const guestsPlaceholders = [];
        const guestsValues = [];
        idx = 1;
        for (const d of days) {
          const metricId = dayToMetricId.get(Number(d.day));
          if (!metricId) continue;

          for (const guest of (d.guests || [])) {
            guestsValues.push(metricId, guest.roomNumber || null, guest.gender || null, guest.age || null, guest.status || null, guest.nationality || null, guest.isCheckIn ? true : false);
            guestsPlaceholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
          }
        }

        if (guestsPlaceholders.length > 0) {
          await client.query(
            `INSERT INTO guests (metric_id, room_number, gender, age, status, nationality, is_check_in)
             VALUES ${guestsPlaceholders.join(', ')}`,
            guestsValues
          );
        }

        await client.query('COMMIT');

        // success
        return res.status(201).json({
          success: true,
          submission_id: submissionId,
          averageGuestNights,
          averageRoomOccupancyRate,
          averageGuestsPerRoom,
        });
      } catch (err) {
        await client.query('ROLLBACK');
        // retry on serialization/deadlock only
        if (err.code === '40001' || err.code === '40P01') {
          const backoff = Math.min(2000, Math.pow(2, attempt) * 200);
          console.warn(`tx retry attempt ${attempt} due to ${err.code}, sleeping ${backoff}ms`);
          await new Promise(r => setTimeout(r, backoff));
          continue;
        }
        console.error('Submission error:', err);
        return res.status(500).json({ error: 'Failed to save submission' });
      }
    }

    // if all attempts failed
    return res.status(409).json({ error: 'Submission conflict. Please retry.' });

  } catch (err) {
    console.error('Submit outer error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  } finally {
    client.release();
  }
};

exports.history = async (req, res) => {
  try {
    const { userId } = req.params;
    const submissions = await SubmissionModel.getSubmissionHistory(userId);
    res.json(submissions);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Failed to fetch submission history" });
  }
};

exports.getUserStatistics = async (req, res) => {
  try {
    const { userId } = req.params;
    const statistics = await SubmissionModel.getUserStatistics(userId);
    res.json(statistics);
  } catch (err) {
    console.error("User statistics error:", err);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
};

exports.getUserMonthlyMetrics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { year } = req.query;
    const metrics = await SubmissionModel.getUserMonthlyMetrics(userId, year);
    res.json(metrics);
  } catch (err) {
    console.error("User monthly metrics error:", err);
    res.status(500).json({ error: "Failed to fetch user monthly metrics" });
  }
};

exports.details = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await SubmissionModel.getSubmissionDetails(submissionId);

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const nationalityCounts = {};
    const days = submission.days || [];
    days.forEach((day) => {
      const guests = day.guests || [];
      guests.forEach((guest) => {
        if (guest.isCheckIn) {
          const nationality = guest.nationality;
          nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + 1;
        }
      });
    });

    const response = {
      ...submission,
      nationalityCounts,
    };

    res.json(response);
  } catch (err) {
    console.error("Details error:", err);
    res.status(500).json({ error: "Failed to fetch submission details" });
  }
};

exports.updatePenaltyStatus = async (req, res) => {
  const { submissionId } = req.params;
  const { penalty, receipt_number, access_code } = req.body;

  // Validate access code
  if (!access_code || access_code !== process.env.ACCESS_CODE) {
    return res.status(401).json({ message: "Invalid access code" });
  }

  try {
    // Update penalty and receipt_number in the database
    await SubmissionModel.updatePenaltyStatus(submissionId, penalty, receipt_number);
    res.json({ message: "Penalty status updated successfully" });
  } catch (err) {
    console.error("Error updating penalty status:", err);
    res.status(500).json({ error: "Failed to update penalty status" });
  }
};

exports.deleteSubmission = async (req, res) => {
  const client = await pool.connect();
  try {
    const { submissionId } = req.params;
    await client.query("BEGIN");
    await SubmissionModel.deleteSubmission(client, submissionId);
    await client.query("COMMIT");
    res.json({ message: "Submission deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete submission" });
  } finally {
    client.release();
  }
};

exports.checkSubmission = async (req, res) => {
  try {
    const { user_id, month, year } = req.query;
    const hasSubmitted = await SubmissionModel.checkSubmissionExists(user_id, month, year);
    res.json({ hasSubmitted });
  } catch (err) {
    console.error("Error checking submission:", err);
    res.status(500).json({ error: "Failed to check submission" });
  }
};

exports.getSubmission = async (req, res) => {
  const { userId, month, year } = req.params;
  try {
    const submission = await SubmissionModel.getSubmissionByDate(userId, month, year);
    res.json(submission);
  } catch (err) {
    console.error("Error fetching submission:", err);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
};

// Draft related controllers
exports.saveDraft = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, month, year, data } = req.body;
    if (!Array.isArray(data)) throw new Error("Invalid data format - expected array");
    
    await client.query("BEGIN");
    await SubmissionModel.saveDraft(client, userId, month, year, data);
    await client.query("COMMIT");
    res.status(200).json({ message: "Draft saved successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error saving draft:", err);
    res.status(500).json({ 
      error: "Failed to save draft",
      details: err.message
    });
  } finally {
    client.release();
  }
};

exports.getDraft = async (req, res) => {
  try {
    const { userId, month, year } = req.params;
    const data = await SubmissionModel.getDraft(userId, month, year);
    res.json({ days: data, isDraft: data.length > 0 });
  } catch (err) {
    console.error("Error fetching draft:", err);
    res.status(500).json({ error: "Failed to fetch draft" });
  }
};

exports.deleteDraft = async (req, res) => {
  try {
    const { userId, month, year } = req.params;
    await SubmissionModel.deleteDraft(userId, month, year);
    res.json({ message: "Draft deleted successfully" });
  } catch (err) {
    console.error("Error deleting draft:", err);
    res.status(500).json({ error: "Failed to delete draft" });
  }
};

exports.getAllDrafts = async (req, res) => {
  try {
    const drafts = await SubmissionModel.getAllDrafts();
    res.json(drafts);
  } catch (err) {
    console.error("Error fetching drafts:", err);
    res.status(500).json({ error: "Failed to fetch drafts" });
  }
};

exports.getDraftDetails = async (req, res) => {
  try {
    const { draftId } = req.params;
    const draft = await SubmissionModel.getDraftDetails(draftId);
    
    if (!draft) {
      return res.status(404).json({ error: "Draft not found" });
    }

    const daysInMonth = new Date(draft.year, draft.month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
      const dayData = draft.data.find((d) => d.day === day) || { day, guests: [] };
      const checkIns = dayData.guests.filter(g => g.isCheckIn).length;
      const overnight = dayData.guests.length;
      const occupied = new Set(dayData.guests.map(g => g.room)).size;
      return {
        day,
        check_ins: checkIns,
        overnight: overnight,
        occupied: occupied,
        guests: dayData.guests
      };
    });

    res.json({
      month: draft.month,
      year: draft.year,
      company_name: draft.company_name,
      number_of_rooms: draft.number_of_rooms,
      days: days
    });
  } catch (err) {
    console.error("Error fetching draft details:", err);
    res.status(500).json({ error: "Failed to fetch draft details" });
  }
};

exports.getUserGuestDemographics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;
    const demographics = await SubmissionModel.getUserGuestDemographics(userId, year, month);
    res.json(demographics);
  } catch (err) {
    console.error("User guest demographics error:", err);
    res.status(500).json({ error: "Failed to fetch guest demographics" });
  }
};

exports.getUserNationalityCounts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;
    const counts = await SubmissionModel.getUserNationalityCounts(userId, year, month);
    res.json(counts);
  } catch (err) {
    console.error("User nationality counts error:", err);
    res.status(500).json({ error: "Failed to fetch nationality counts" });
  }
};

// New endpoint to remove a stay across all months
exports.removeStayFromAllMonths = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, stayId } = req.params;
    
    if (!userId || !stayId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    
    // console.log("\n" + "=".repeat(80));
    // console.log(`🗑️ REMOVE STAY REQUEST - User: ${userId}, StayId: ${stayId}`);
    // console.log("=".repeat(80));
    
    await client.query("BEGIN");
    
    // Get all drafts for this user
    const result = await client.query(
      `SELECT draft_id, month, year, data FROM draft_submissions WHERE user_id = $1`,
      [userId]
    );
    
    // console.log(`📊 Found ${result.rows.length} draft entries for user ${userId}`);
    
    let totalRemoved = 0;
    const updatedDrafts = [];
    const allRemovedData = [];
    
    for (const draft of result.rows) {
      const monthData = draft.data || [];
      const originalLength = monthData.length;
      
      // console.log(`\n🔍 Checking ${draft.month}/${draft.year}: ${originalLength} entries`);
      
      // Filter out entries with the specified stayId
      const filteredData = monthData.filter((entry) => entry.stayId !== stayId);
      const removedCount = originalLength - filteredData.length;
      
      if (removedCount > 0) {
        // console.log(`   ❌ Removing ${removedCount} entries from ${draft.month}/${draft.year} for stayId: ${stayId}`);
        
        // Log the entries being removed with full details
        const removedEntries = monthData.filter((entry) => entry.stayId === stayId);
        // console.log(`   📋 DETAILED REMOVAL LIST:`);
        
        removedEntries.forEach((entry, index) => {
          // console.log(`      ${index + 1}. Day ${entry.day}, Room ${entry.room}`);
          // console.log(`         ├─ StayId: ${entry.stayId}`);
          // console.log(`         ├─ isCheckIn: ${entry.isCheckIn}`);
          // console.log(`         ├─ isStartDay: ${entry.isStartDay}`);
          // console.log(`         ├─ lengthOfStay: ${entry.lengthOfStay}`);
          // console.log(`         ├─ startDay: ${entry.startDay}`);
          // console.log(`         ├─ startMonth: ${entry.startMonth}`);
          // console.log(`         ├─ startYear: ${entry.startYear}`);
          // console.log(`         └─ Guests: ${entry.guests?.length || 0}`);
          
          // Log guest details if any
          if (entry.guests && entry.guests.length > 0) {
            entry.guests.forEach((guest, guestIndex) => {
              // console.log(`            👤 Guest ${guestIndex + 1}: ${guest.gender}, Age: ${guest.age}, ${guest.nationality}`);
            });
          }
          
          // Store for summary
          allRemovedData.push({
            month: draft.month,
            year: draft.year,
            day: entry.day,
            room: entry.room,
            guests: entry.guests?.length || 0,
            isStartDay: entry.isStartDay,
            isCheckIn: entry.isCheckIn
          });
        });
        
        totalRemoved += removedCount;
        
        // Update the draft with filtered data
        await client.query(
          `UPDATE draft_submissions SET data = $1::jsonb, last_updated = CURRENT_TIMESTAMP WHERE draft_id = $2`,
          [JSON.stringify(filteredData), draft.draft_id]
        );
        
        updatedDrafts.push({ month: draft.month, year: draft.year, removed: removedCount });
      } else {
        // console.log(`   ✅ No entries found for stayId ${stayId} in ${draft.month}/${draft.year}`);
      }
    }
    
    await client.query("COMMIT");
    
    // console.log("\n" + "=".repeat(80));
    // console.log(`📈 REMOVAL SUMMARY:`);
    // console.log("=".repeat(80));
    // console.log(`🏨 Total entries removed: ${totalRemoved}`);
    // console.log(`📅 Months affected: ${updatedDrafts.length}`);
    
    // if (allRemovedData.length > 0) {
    //   // console.log(`\n📋 COMPLETE REMOVAL BREAKDOWN:`);
    //   allRemovedData.forEach((item, index) => {
    //     // console.log(`   ${index + 1}. ${item.month}/${item.year} - Day ${item.day}, Room ${item.room} (${item.guests} guests)`);
    //     if (item.isStartDay) console.log(`      ⭐ START DAY`);
    //     if (item.isCheckIn) console.log(`      🚪 CHECK-IN DAY`);
    //   });
    // }
    
    // console.log("=".repeat(80));
    
    res.json({ 
      message: "Stay removed successfully from all months",
      totalRemoved,
      updatedDrafts
    });
    
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error removing stay from all months:", err);
    res.status(500).json({ error: "Failed to remove stay from all months" });
  } finally {
    client.release();
  }
};

exports.getRoomNames = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query("SELECT room_names FROM users WHERE user_id = $1", [userId]);
    res.json({ roomNames: result.rows[0]?.room_names || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch room names" });
  }
};

exports.saveRoomNames = async (req, res) => {
  const { userId } = req.params;
  const { roomNames } = req.body;
  try {
    await pool.query("UPDATE users SET room_names = $1 WHERE user_id = $2", [JSON.stringify(roomNames), userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save room names" });
  }
};

exports.getAllDraftsForUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch all drafts for the user
    const drafts = await SubmissionModel.getAllDraftsForUser(userId);

    // Transform drafts into the desired format
    const data = drafts.reduce((acc, draft) => {
      const key = `${draft.year}-${draft.month}`;
      acc[key] = draft.data;
      return acc;
    }, {});

    res.json(data);
  } catch (err) {
    console.error("Error fetching drafts:", err);
    res.status(500).json({ error: "Failed to fetch drafts" });
  }
};

// Draft Stays endpoints
exports.saveDraftStay = async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      userId, day, month, year, roomNumber, stayId, 
      isCheckIn, isStartDay, lengthOfStay, startDay, 
      startMonth, startYear, guests 
    } = req.body;

    await client.query("BEGIN");

    // Upsert the stay record - multiple stays can exist for same room/day
    await client.query(
      `INSERT INTO draft_stays 
       (user_id, day, month, year, room_number, stay_id, is_check_in, is_start_day, 
        length_of_stay, start_day, start_month, start_year, guests)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)
       ON CONFLICT (user_id, day, month, year, room_number, stay_id) 
       DO UPDATE SET 
         is_check_in = $7, is_start_day = $8, 
         length_of_stay = $9, start_day = $10, start_month = $11, 
         start_year = $12, guests = $13::jsonb, last_updated = CURRENT_TIMESTAMP`,
      [userId, day, month, year, roomNumber, stayId, isCheckIn, isStartDay,
       lengthOfStay, startDay, startMonth, startYear, JSON.stringify(guests)]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Draft stay saved successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error saving draft stay:", err);
    res.status(500).json({ error: "Failed to save draft stay" });
  } finally {
    client.release();
  }
};

exports.getDraftStays = async (req, res) => {
  try {
    const { userId, month, year } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM draft_stays 
       WHERE user_id = $1 AND month = $2 AND year = $3
       ORDER BY day, room_number`,
      [userId, month, year]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching draft stays:", err);
    res.status(500).json({ error: "Failed to fetch draft stays" });
  }
};

exports.deleteDraftStay = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, stayId } = req.params;
    
    console.log(`🗑️ Deleting ALL entries for stayId: ${stayId}, user: ${userId}`);
    
    await client.query("BEGIN");
    
    // Delete all stays with this stayId for the user
    const result = await client.query(
      `DELETE FROM draft_stays WHERE user_id = $1 AND stay_id = $2 RETURNING *`,
      [userId, stayId]
    );
    
    await client.query("COMMIT");
    
    console.log(`✅ Deleted ${result.rows.length} entries for stayId: ${stayId}`);
    
    res.json({ 
      message: "Draft stay deleted successfully",
      deletedCount: result.rows.length 
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting draft stay:", err);
    res.status(500).json({ error: "Failed to delete draft stay" });
  } finally {
    client.release();
  }
};

exports.deleteDraftStaysByMonth = async (req, res) => {
  try {
    const { userId, month, year } = req.params;
    
    await pool.query(
      `DELETE FROM draft_stays WHERE user_id = $1 AND month = $2 AND year = $3`,
      [userId, month, year]
    );
    
    res.json({ message: "Draft stays deleted successfully" });
  } catch (err) {
    console.error("Error deleting draft stays:", err);
    res.status(500).json({ error: "Failed to delete draft stays" });
  }
};

exports.getAllDraftStaysForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM draft_stays 
       WHERE user_id = $1
       ORDER BY year, month, day, room_number`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all draft stays:", err);
    res.status(500).json({ error: "Failed to fetch draft stays" });
  }
};

exports.getLastUpdateTimestamp = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT MAX(last_updated) as last_update 
       FROM draft_stays 
       WHERE user_id = $1`,
      [userId]
    );
    
    // If no draft stays, use current time
    const lastUpdate = result.rows[0]?.last_update || new Date();
    
    res.json({ 
      lastUpdate: new Date(lastUpdate).getTime()
    });
  } catch (err) {
    console.error("Error getting last update:", err);
    
    // Fallback: return current time if there's an error
    res.json({ 
      lastUpdate: Date.now()
    });
  }
};

// Also fix the saveDraftStay method to use the correct column name
exports.saveDraftStay = async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      userId, day, month, year, roomNumber, stayId, 
      isCheckIn, isStartDay, lengthOfStay, startDay, 
      startMonth, startYear, guests 
    } = req.body;

    await client.query("BEGIN");

    // Use the correct column name: last_updated (with underscore)
    await client.query(
      `INSERT INTO draft_stays 
       (user_id, day, month, year, room_number, stay_id, is_check_in, is_start_day, 
        length_of_stay, start_day, start_month, start_year, guests, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, day, month, year, room_number, stay_id) 
       DO UPDATE SET 
         is_check_in = $7, is_start_day = $8, 
         length_of_stay = $9, start_day = $10, start_month = $11, 
         start_year = $12, guests = $13::jsonb, last_updated = CURRENT_TIMESTAMP`,
      [userId, day, month, year, roomNumber, stayId, isCheckIn, isStartDay,
       lengthOfStay, startDay, startMonth, startYear, JSON.stringify(guests)]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Draft stay saved successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error saving draft stay:", err);
    res.status(500).json({ error: "Failed to save draft stay" });
  } finally {
    client.release();
  }
};

// In submissionsController.js - Add this endpoint
exports.deleteDraftStaysByDayRoom = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, day, month, year, roomNumber } = req.params;
    
    console.log(`🗑️ Deleting all stays for user ${userId}, room ${roomNumber}, day ${day}, ${month}/${year}`);
    
    await client.query("BEGIN");
    
    // Delete all stays matching the criteria
    const result = await client.query(
      `DELETE FROM draft_stays 
       WHERE user_id = $1 AND day = $2 AND month = $3 AND year = $4 AND room_number = $5
       RETURNING *`,
      [userId, day, month, year, roomNumber]
    );
    
    await client.query("COMMIT");
    
    console.log(`✅ Deleted ${result.rows.length} stays`);
    
    res.json({ 
      message: "Draft stays deleted successfully",
      deletedCount: result.rows.length 
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting draft stays by day/room:", err);
    res.status(500).json({ error: "Failed to delete draft stays" });
  } finally {
    client.release();
  }
};