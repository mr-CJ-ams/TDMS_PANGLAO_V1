const AdminModel = require("../models/adminModel");
const { sendEmailNotification } = require("../utils/email");

// Get all users with role 'user'
exports.getUsers = async (req, res) => {
  try {
    const allUsers = await AdminModel.getUsers();
    res.json(allUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Approve User
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await AdminModel.getUserEmailById(id);
    if (!email) return res.status(404).json({ success: false, message: "User email not found." });

    const subject = "Your TDMS Account Has Been Approved";
    const message = `
      Dear Valued User,<br><br>
      We are pleased to inform you that your account registration for the Tourism Data Management System (TDMS) has been approved.<br><br>
      You may now log in and access the system using the following link:<br>
      <a href=\"https://tdms-panglao-client.onrender.com\">Login Link</a><br><br>
      If you have any questions or require assistance, please do not hesitate to contact our office.<br><br>
      Thank you for your interest in the TDMS.<br><br>
      Best regards,<br>
      Panglao Tourism Office
    `;
    await sendEmailNotification(email, subject, message);
    await AdminModel.approveUser(id);
    res.json({ success: true, message: "User approved and email sent successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Failed to send email. User not approved." });
  }
};

// Decline User
exports.declineUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { message: declineMessage } = req.body;
    const email = await AdminModel.getUserEmailById(id);
    if (!email) return res.status(404).json({ success: false, message: "User email not found." });

    const subject = "Your TDMS Account Application Status";
    const message = `
      Dear Applicant,<br><br>
      We regret to inform you that your registration for the Tourism Data Management System (TDMS) has not been approved.<br><br>
      <strong>Reason for decline:</strong> ${declineMessage}<br><br>
      If you believe this decision was made in error or if you have any questions, please contact our office for further clarification.<br><br>
      Thank you for your interest in the TDMS.<br><br>
      Sincerely,<br>
      Panglao Tourism Office
    `;
    await sendEmailNotification(email, subject, message);
    await AdminModel.declineUser(id);
    res.json({ success: true, message: "User declined and email sent successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Failed to send email. User not declined." });
  }
};

// Deactivate User
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AdminModel.deactivateUser(id);
    
    if (result === null) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deactivated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Accommodation Type
exports.updateAccommodation = async (req, res) => {
  try {
    const { id } = req.params;
    const { accommodation_type } = req.body;
    
    await AdminModel.updateAccommodation(id, accommodation_type);
    res.json({ message: "Accommodation type updated successfully" });
  } catch (err) {
    console.error("Error updating accommodation type:", err);
    res.status(500).json({ error: "Failed to update accommodation type" });
  }
};

// Get submissions with filters, pagination, and search
exports.getSubmissions = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, month, year, status, penaltyStatus, search,
    } = req.query;
    const offset = (page - 1) * limit;
    
    const { submissions, total } = await AdminModel.getSubmissions(
      { month, year, status, penaltyStatus, search },
      { limit, offset }
    );
    
    res.json({
      submissions,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("Submissions error:", err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

// Monthly Check-ins
exports.getMonthlyCheckins = async (req, res) => {
  try {
    const { year } = req.query;
    const result = await AdminModel.getMonthlyCheckins(year);
    res.json(result);
  } catch (err) {
    console.error("Error fetching monthly check-ins:", err);
    res.status(500).json({ error: "Failed to fetch monthly check-ins" });
  }
};

// Monthly Metrics
exports.getMonthlyMetrics = async (req, res) => {
  try {
    const { year } = req.query;
    const { metrics, totalUsers } = await AdminModel.getMonthlyMetrics(year);
    
    const metricsWithSubmissionRate = metrics.map((row) => ({
      ...row,
      submission_rate: totalUsers > 0 ? ((row.total_submissions / totalUsers) * 100).toFixed(2) : 0,
    }));
    
    res.json(metricsWithSubmissionRate);
  } catch (err) {
    console.error("Error fetching monthly metrics:", err);
    res.status(500).json({ error: "Failed to fetch monthly metrics" });
  }
};

// Nationality Counts
exports.getNationalityCounts = async (req, res) => {
  try {
    const { year, month } = req.query;
    const result = await AdminModel.getNationalityCounts(year, month);
    res.json(result);
  } catch (err) {
    console.error("Error fetching nationality counts:", err);
    res.status(500).json({ error: "Failed to fetch nationality counts" });
  }
};

// Nationality Counts by Establishment
exports.getNationalityCountsByEstablishment = async (req, res) => {
  try {
    const { year, month } = req.query;
    const result = await AdminModel.getNationalityCountsByEstablishment(year, month);
    res.json(result);
  } catch (err) {
    console.error("Error fetching nationality counts by establishment:", err);
    res.status(500).json({ error: "Failed to fetch nationality counts by establishment" });
  }
};

// Guest Demographics
exports.getGuestDemographics = async (req, res) => {
  try {
    const { year, month } = req.query;
    const result = await AdminModel.getGuestDemographics(year, month);
    res.json(result);
  } catch (err) {
    console.error("Error fetching guest demographics:", err);
    res.status(500).json({ error: "Failed to fetch guest demographics" });
  }
};