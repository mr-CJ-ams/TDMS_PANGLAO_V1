const { SubmissionModel, pool } = require("../models/submissionModel");
exports.submit = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, month, year, days } = req.body;
    if (!user_id || !month || !year || !days) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const numberOfRooms = await SubmissionModel.getUserRoomCount(user_id);
    const deadline = SubmissionModel.calculateDeadline(month, year);
    const currentTime = SubmissionModel.getPhilippinesTime();
    const isLate = currentTime > deadline;
    const penaltyAmount = isLate ? 1500 : 0;

    let totalCheckIns = 0, totalOvernight = 0, totalOccupied = 0;
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
    const submissionId = await SubmissionModel.createSubmission(client, {
      user_id, month, year, deadline, currentTime, isLate, penaltyAmount,
      averageGuestNights, averageRoomOccupancyRate, averageGuestsPerRoom, numberOfRooms
    });

    for (const dayData of days) {
      const metricId = await SubmissionModel.createDailyMetric(client, submissionId, dayData);
      for (const guest of dayData.guests) {
        await SubmissionModel.createGuest(client, metricId, guest);
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
      days: req.body.days,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Submission error:", err);
    res.status(500).json({ error: "Failed to save submission" });
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

exports.updatePenalty = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { penalty } = req.body;
    if (typeof penalty !== "boolean") {
      return res.status(400).json({ error: "Invalid penalty status" });
    }
    await SubmissionModel.updatePenaltyStatus(submissionId, penalty);
    res.json({ message: "Penalty status updated successfully" });
  } catch (err) {
    console.error("Penalty error:", err);
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

