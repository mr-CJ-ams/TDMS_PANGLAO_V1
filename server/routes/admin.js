const express = require("express");
const router = express.Router();
const pool = require("../db");
const { sendEmailNotification } = require("../utils/email");

// Get all users
router.get("/users", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users WHERE role = 'user'");
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Approve User
router.put("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE users SET is_approved = true WHERE user_id = $1", [id]);

    // Fetch user email
    const user = await pool.query("SELECT email FROM users WHERE user_id = $1", [id]);
    const email = user.rows[0].email;

    // Send approval email with login link
    const subject = "Your TDMS Account Has Been Approved";
    const message = `
      Your account has been approved. You can now log in to the Tourism Data Management System (TDMS) using the link below:
      
      Login Link: https://tdms-panglao-client.onrender.com

      Thank you for using TDMS!
    `;

    sendEmailNotification(email, subject, message);

    res.json("User approved");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Decline User
router.put("/decline/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body; // Get the custom message from the request body

    // Fetch user email
    const user = await pool.query("SELECT email FROM users WHERE user_id = $1", [id]);
    const email = user.rows[0].email;

    // Send decline email with the custom message
    sendEmailNotification(email, `Your account has been declined. Reason: ${message}`);

    // Delete the user
    await pool.query("DELETE FROM users WHERE user_id = $1", [id]);

    res.json("User declined");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Delete User
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the user
    await pool.query("DELETE FROM users WHERE user_id = $1", [id]);

    res.json("User deleted");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update Accommodation Type
router.put("/update-accommodation/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { accommodation_type } = req.body;

    await pool.query("UPDATE users SET accommodation_type = $1 WHERE user_id = $2", [
      accommodation_type,
      id,
    ]);

    res.json("Accommodation type updated");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Inside server/routes/admin.js
// Inside server/routes/admin.js
router.get("/submissions", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      month,
      year,
      status,
      penaltyStatus,
      search,
    } = req.query;

    const offset = (page - 1) * limit;

    // Base query
    let query = `
      SELECT s.submission_id, s.user_id, s.month, s.year, 
             s.submitted_at, s.is_late, s.penalty, s.deadline,
             s.average_guest_nights, s.average_room_occupancy_rate, s.average_guests_per_room,
             u.company_name
      FROM submissions s
      JOIN users u ON s.user_id = u.user_id
    `;

    // Array to hold filter conditions
    const filters = [];
    const params = [];

    // Add filters based on query parameters
    if (month) {
      filters.push(`s.month = $${params.length + 1}`);
      params.push(month);
    }
    if (year) {
      filters.push(`s.year = $${params.length + 1}`);
      params.push(year);
    }
    if (status) {
      if (status === "Late") {
        filters.push(`s.is_late = true`);
      } else if (status === "On-Time") {
        filters.push(`s.is_late = false`);
      }
    }
    if (penaltyStatus) {
      if (penaltyStatus === "Paid") {
        filters.push(`s.penalty = true`);
      } else if (penaltyStatus === "Unpaid") {
        filters.push(`s.penalty = false`);
      }
    }
    if (search) {
      filters.push(`u.company_name ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }

    // Add filters to the query
    if (filters.length > 0) {
      query += ` WHERE ${filters.join(" AND ")}`;
    }

    // Add sorting and pagination
    query += `
      ORDER BY s.submitted_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    // Execute the query
    const submissions = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM submissions s
      JOIN users u ON s.user_id = u.user_id
    `;
    if (filters.length > 0) {
      countQuery += ` WHERE ${filters.join(" AND ")}`;
    }
    const totalCount = await pool.query(countQuery, params.slice(0, -2)); // Exclude limit and offset for count

    res.json({
      submissions: submissions.rows,
      total: parseInt(totalCount.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("Submissions error:", err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Inside server/routes/admin.js
router.get("/monthly-checkins", async (req, res) => {
  try {
    const { year } = req.query;

    const query = `
      SELECT month, SUM(check_ins) AS total_check_ins
      FROM submissions
      JOIN daily_metrics ON submissions.submission_id = daily_metrics.submission_id
      WHERE year = $1
      GROUP BY month
      ORDER BY month ASC
    `;

    const result = await pool.query(query, [year]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching monthly check-ins:", err);
    res.status(500).json({ error: "Failed to fetch monthly check-ins" });
  }
});

// Inside server/routes/admin.js
// Inside server/routes/admin.js
router.get("/monthly-metrics", async (req, res) => {
  try {
    const { year } = req.query;

    // Query to fetch monthly metrics
    const query = `
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
      JOIN daily_metrics dm ON s.submission_id = dm.submission_id
      WHERE s.year = $1
      GROUP BY s.month
      ORDER BY s.month ASC
    `;

    const result = await pool.query(query, [year]);

    // Fetch total number of users with role "user"
    const usersCount = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'user'`
    );
    const totalUsers = usersCount.rows[0].count;

    // Calculate submission rate for each month
    const metricsWithSubmissionRate = result.rows.map((row) => ({
      ...row,
      submission_rate: totalUsers > 0 ? ((row.total_submissions / totalUsers) * 100).toFixed(2) : 0,
    }));

    res.json(metricsWithSubmissionRate);
  } catch (err) {
    console.error("Error fetching monthly metrics:", err);
    res.status(500).json({ error: "Failed to fetch monthly metrics" });
  }
});

// Inside server/routes/admin.js
// Inside server/routes/admin.js
router.get("/nationality-counts", async (req, res) => {
  try {
    const { year, month } = req.query;

    const query = `
      SELECT 
        g.nationality, 
        COUNT(*) AS count,
        SUM(CASE WHEN g.gender = 'Male' THEN 1 ELSE 0 END) AS male_count,
        SUM(CASE WHEN g.gender = 'Female' THEN 1 ELSE 0 END) AS female_count
      FROM guests g
      JOIN daily_metrics dm ON g.metric_id = dm.metric_id
      JOIN submissions s ON dm.submission_id = s.submission_id
      WHERE s.year = $1 AND s.month = $2 AND g.is_check_in = true
      GROUP BY g.nationality
      ORDER BY count DESC
    `;

    const result = await pool.query(query, [year, month]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching nationality counts:", err);
    res.status(500).json({ error: "Failed to fetch nationality counts" });
  }
});

// Inside server/routes/admin.js
// Inside server/routes/admin.js
router.get("/guest-demographics", async (req, res) => {
  try {
    const { year, month } = req.query;

    // Query to fetch guest demographics
    const query = `
      SELECT 
        g.gender,
        CASE 
          WHEN g.age < 18 THEN 'Minors'
          ELSE 'Adults'
        END AS age_group,
        g.status,
        COUNT(*) AS count
      FROM guests g
      JOIN daily_metrics dm ON g.metric_id = dm.metric_id
      JOIN submissions s ON dm.submission_id = s.submission_id
      WHERE s.year = $1 AND s.month = $2 AND g.is_check_in = true
      GROUP BY g.gender, age_group, g.status
      ORDER BY g.gender, age_group, g.status
    `;

    const result = await pool.query(query, [year, month]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching guest demographics:", err);
    res.status(500).json({ error: "Failed to fetch guest demographics" });
  }
});

// Inside server/routes/admin.js
router.put("/update-accommodation/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { accommodation_type } = req.body;

    // Map accommodation type to code
    const accommodationCodes = {
      Hotel: "HTL",
      Condotel: "CON",
      "Serviced Residence": "SER",
      Resort: "RES",
      Apartelle: "APA",
      Motel: "MOT",
      "Pension House": "PEN",
      "Home Stay Site": "HSS",
      "Tourist Inn": "TIN",
      Other: "OTH",
    };

    const accommodation_code = accommodationCodes[accommodation_type] || "OTH";

    // Update the user's accommodation type and code
    await pool.query(
      `UPDATE users SET accommodation_type = $1, accommodation_code = $2 WHERE user_id = $3`,
      [accommodation_type, accommodation_code, userId]
    );

    res.json({ message: "Accommodation type updated successfully" });
  } catch (err) {
    console.error("Error updating accommodation type:", err);
    res.status(500).json({ error: "Failed to update accommodation type" });
  }
});
module.exports = router;

