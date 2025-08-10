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

exports.updatePenalty = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { penalty, receipt_number } = req.body;
    if (typeof penalty !== "boolean") {
      return res.status(400).json({ error: "Invalid penalty status" });
    }
    await SubmissionModel.updatePenaltyStatus(submissionId, penalty, receipt_number);
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

