const pool = require("../db");

class AdminModel {
  // User related methods
  static async getUsers() {
    const result = await pool.query("SELECT * FROM users WHERE role = 'user'");
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
  static async getSubmissions({ month, year, status, penaltyStatus, search }, { limit, offset }) {
    let query = `
      SELECT s.submission_id, s.user_id, s.month, s.year, 
             s.submitted_at, s.is_late, s.penalty, s.deadline,
             s.average_guest_nights, s.average_room_occupancy_rate, s.average_guests_per_room,
             u.company_name
      FROM submissions s
      JOIN users u ON s.user_id = u.user_id
    `;
    const filters = [];
    const params = [];
    
    if (month) { filters.push(`s.month = $${params.length + 1}`); params.push(month); }
    if (year) { filters.push(`s.year = $${params.length + 1}`); params.push(year); }
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

    if (filters.length > 0) query += ` WHERE ${filters.join(" AND ")}`;
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
    if (filters.length > 0) countQuery += ` WHERE ${filters.join(" AND ")}`;
    
    const totalCount = await pool.query(countQuery, params.slice(0, -2));
    
    return {
      submissions: submissions.rows,
      total: parseInt(totalCount.rows[0].count)
    };
  }

  // Analytics related methods
  static async getMonthlyCheckins(year) {
    const query = `
      SELECT month, SUM(check_ins) AS total_check_ins
      FROM submissions
      JOIN daily_metrics ON submissions.submission_id = daily_metrics.submission_id
      WHERE year = $1
      GROUP BY month
      ORDER BY month ASC
    `;
    const result = await pool.query(query, [year]);
    return result.rows;
  }

  static async getMonthlyMetrics(year) {
    const query = `
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
        WHERE s.year = $1
        GROUP BY s.month
      ),
      total_rooms AS (
        SELECT
          month,
          SUM(number_of_rooms) AS total_rooms
        FROM submissions
        WHERE year = $1
        GROUP BY month
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
    const result = await pool.query(query, [year]);
    const usersCount = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'user'`
    );
    return {
      metrics: result.rows,
      totalUsers: usersCount.rows[0].count
    };
  }

  static async getNationalityCounts(year, month) {
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
    return result.rows;
  }

  static async getNationalityCountsByEstablishment(year, month) {
    const query = `
      SELECT 
        u.company_name AS establishment,
        g.nationality, 
        COUNT(*) AS count
      FROM guests g
      JOIN daily_metrics dm ON g.metric_id = dm.metric_id
      JOIN submissions s ON dm.submission_id = s.submission_id
      JOIN users u ON s.user_id = u.user_id
      WHERE s.year = $1 AND s.month = $2 AND g.is_check_in = true
      GROUP BY u.company_name, g.nationality
      ORDER BY u.company_name ASC, g.nationality ASC
    `;
    const result = await pool.query(query, [year, month]);
    return result.rows;
  }

  static async getGuestDemographics(year, month) {
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
    return result.rows;
  }
}

module.exports = AdminModel;