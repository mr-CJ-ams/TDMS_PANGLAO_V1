const express = require("express");
const router = express.Router();
const pool = require("../db");

// Helper function to calculate the deadline using native Date
const calculateDeadline = (month, year) => {
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  // Create a Date object for the deadline in Philippines time
  const deadline = new Date(Date.UTC(nextYear, nextMonth - 1, 10, 23, 59, 59)); // 10th day, 11:59:59 PM
  console.log("Submission Deadline:", deadline.toISOString());

  return deadline;
};

// Helper function to get current time in Philippines
const getPhilippinesTime = () => {
  // Get the current time in Philippines timezone
  const phTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
  console.log("Current Time in the Philippines:", phTime);

  // Convert the Philippines time string back to a Date object
  return new Date(phTime);
};


// Submit a new submission
router.post("/submit", async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, month, year, days } = req.body;

    // Validate input
    if (!user_id || !month || !year || !days) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch the user's current number of rooms
    const user = await pool.query(
      "SELECT number_of_rooms FROM users WHERE user_id = $1",
      [user_id]
    );
    const numberOfRooms = user.rows[0].number_of_rooms;

    // Calculate the deadline
    const deadline = calculateDeadline(month, year);
    const currentTime = getPhilippinesTime();
    const isLate = currentTime > deadline;

    // Set penalty amount for late submissions
    const penaltyAmount = isLate ? 1500 : 0;

    // Calculate metrics
    let totalCheckIns = 0;
    let totalOvernight = 0;
    let totalOccupied = 0;

    days.forEach((day) => {
      totalCheckIns += day.checkIns;
      totalOvernight += day.overnight;
      totalOccupied += day.occupied;
    });

    const averageGuestNights = totalCheckIns > 0 ? (totalOvernight / totalCheckIns).toFixed(2) : 0;
    const averageRoomOccupancyRate =
      numberOfRooms > 0 ? ((totalOccupied / (numberOfRooms * days.length)) * 100).toFixed(2) : 0;
    const averageGuestsPerRoom = totalOccupied > 0 ? (totalOvernight / totalOccupied).toFixed(2) : 0;

    await client.query("BEGIN");

    // Create submission entry with metrics, penalty, and number_of_rooms
    const submissionRes = await client.query(
      `INSERT INTO submissions 
       (user_id, month, year, deadline, submitted_at, is_late, penalty_amount,
        average_guest_nights, average_room_occupancy_rate, average_guests_per_room, number_of_rooms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING submission_id`,
      [
        user_id,
        month,
        year,
        deadline.toISOString(),
        currentTime.toISOString(),
        isLate,
        penaltyAmount,
        averageGuestNights,
        averageRoomOccupancyRate,
        averageGuestsPerRoom,
        numberOfRooms, // Store the number_of_rooms at the time of submission
      ]
    );
    const submissionId = submissionRes.rows[0].submission_id;

    // Insert daily metrics and guests
    for (const dayData of days) {
      const metricRes = await client.query(
        `INSERT INTO daily_metrics 
         (submission_id, day, check_ins, overnight, occupied)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING metric_id`,
        [submissionId, dayData.day, dayData.checkIns, dayData.overnight, dayData.occupied]
      );
      const metricId = metricRes.rows[0].metric_id;

      for (const guest of dayData.guests) {
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
    }

    await client.query("COMMIT");
    res.status(201).json({
      message: "Submission saved successfully",
      submissionId,
      isLate,
      penaltyAmount,
      averageGuestNights,
      averageRoomOccupancyRate,
      averageGuestsPerRoom,
      days: req.body.days, // Return the saved days data
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Submission error:", err);
    res.status(500).json({ error: "Failed to save submission" });
  } finally {
    client.release();
  }
});

// Inside server/routes/submissions.js
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch submission history with penalty status
    const submissions = await pool.query(
      `SELECT s.submission_id, s.month, s.year, s.submitted_at, s.is_late, s.penalty,
              s.average_guest_nights, s.average_room_occupancy_rate, s.average_guests_per_room
       FROM submissions s
       WHERE s.user_id = $1
       ORDER BY s.submitted_at DESC`,
      [userId]
    );

    res.json(submissions.rows);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Failed to fetch submission history" });
  }
});

// Inside server/routes/submissions.js
router.get("/details/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Fetch submission details with nationality counts
    const submissionRes = await pool.query(
      `SELECT s.submission_id, s.month, s.year, s.submitted_at, s.is_late, s.penalty,
              s.average_guest_nights, s.average_room_occupancy_rate, s.average_guests_per_room,
              s.number_of_rooms, -- Include number_of_rooms from submissions
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
       LEFT JOIN daily_metrics dm ON s.submission_id = dm.submission_id
       WHERE s.submission_id = $1
       GROUP BY s.submission_id`,
      [submissionId]
    );

    if (submissionRes.rows.length === 0) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Calculate nationality counts based on Check-In guests
    const nationalityCounts = {};
    const days = submissionRes.rows[0].days || []; // Ensure days is an array
    days.forEach((day) => {
      const guests = day.guests || []; // Ensure guests is an array
      guests.forEach((guest) => {
        if (guest.isCheckIn) {
          const nationality = guest.nationality;
          nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + 1;
        }
      });
    });

    // Add nationality counts to the response
    const response = {
      ...submissionRes.rows[0],
      nationalityCounts,
    };

    console.log("Submission details response:", response); // Debugging
    res.json(response);
  } catch (err) {
    console.error("Details error:", err);
    res.status(500).json({ error: "Failed to fetch submission details" });
  }
});

// Inside server/routes/submissions.js
router.put("/penalty/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { penalty } = req.body;

    // Ensure penalty is a boolean
    if (typeof penalty !== "boolean") {
      return res.status(400).json({ error: "Invalid penalty status" });
    }

    // Update the penalty status in the database
    await pool.query(
      `UPDATE submissions SET penalty = $1 WHERE submission_id = $2`,
      [penalty, submissionId]
    );

    res.json({ message: "Penalty status updated successfully" });
  } catch (err) {
    console.error("Penalty error:", err);
    res.status(500).json({ error: "Failed to update penalty status" });
  }
});

// Delete a submission
router.delete("/:submissionId", async (req, res) => {
  const client = await pool.connect();
  try {
    const { submissionId } = req.params;

    await client.query("BEGIN");

    // Delete guests
    await client.query(
      `DELETE FROM guests
       WHERE metric_id IN (
         SELECT metric_id FROM daily_metrics WHERE submission_id = $1
       )`,
      [submissionId]
    );

    // Delete daily metrics
    await client.query(
      `DELETE FROM daily_metrics WHERE submission_id = $1`,
      [submissionId]
    );

    // Delete submission
    await client.query(
      `DELETE FROM submissions WHERE submission_id = $1`,
      [submissionId]
    );

    await client.query("COMMIT");
    res.json({ message: "Submission deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete submission" });
  } finally {
    client.release();
  }
});


router.get("/check-submission", async (req, res) => {
  try {
    const { user_id, month, year } = req.query;

    const result = await pool.query(
      `SELECT * FROM submissions WHERE user_id = $1 AND month = $2 AND year = $3`,
      [user_id, month, year]
    );

    res.json({ hasSubmitted: result.rows.length > 0 });
  } catch (err) {
    console.error("Error checking submission:", err);
    res.status(500).json({ error: "Failed to check submission" });
  }
});

router.get("/:userId/:month/:year", async (req, res) => {
  const { userId, month, year } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM submissions WHERE user_id = $1 AND month = $2 AND year = $3`,
      [userId, month, year]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error("Error fetching submission:", err);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
});



module.exports = router;

