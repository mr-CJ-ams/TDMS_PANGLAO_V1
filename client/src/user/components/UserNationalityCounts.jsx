/**
 * UserNationalityCounts.jsx
 * 
 * Panglao Tourist Data Management System - User Nationality Counts Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays a table of guest nationality counts for a user's monthly accommodation submission.
 * It fetches, summarizes, and presents nationality breakdowns (total, male, female) for the selected year and month.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Fetches nationality counts from the backend API for the authenticated user, year, and month.
 * - Renders a responsive table showing nationality, total count, male count, and female count.
 * - Handles loading, error, and empty states gracefully.
 * - Displays contextual information (selected year and month) above the table.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses axios for API communication and sessionStorage for authentication.
 * - Responsive and accessible UI with clear feedback and table styling.
 * - Modular design for easy integration into the user dashboard.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the user dashboard to review monthly nationality breakdowns of guests.
 * - Allows users to view official nationality counts for record-keeping or reporting.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The backend endpoint for fetching data is:
 *     GET /api/submissions/nationality-counts/:userId?year=YYYY&month=MM
 * - Update this component if nationality categories or table columns change.
 * - Extend table rendering or export logic as needed for new reporting requirements.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/pages/UserDashboard.jsx         (renders UserNationalityCounts)
 * - server/controllers/submissionsController.js (handles backend nationality logic)
 * - server/routes/submissions.js                (defines backend endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React, { useEffect, useState } from "react";
import { submissionsAPI } from "../../services/api";

const UserNationalityCounts = ({ user, selectedYear, selectedMonth, formatMonth }) => {
  const [nationalityCounts, setNationalityCounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !selectedYear || !selectedMonth) return;
    
    const fetchNationalityCounts = async () => {
      setLoading(true);
      try {
        const data = await submissionsAPI.getUserNationalityCounts(
          user.user_id, 
          selectedYear, 
          selectedMonth
        );
        setNationalityCounts(data);
      } catch (err) {
        setNationalityCounts([]);
        console.error("Error fetching nationality counts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNationalityCounts();
  }, [user, selectedYear, selectedMonth]);

  return (
    <div style={{ padding: 20, backgroundColor: "#E0F7FA", marginTop: 24, borderRadius: 12 }}>
      <h3 style={{ color: "#37474F", marginBottom: 20 }}>Nationality Counts</h3>
      <div style={{ marginBottom: 20 }}>
        <span style={{ color: "#0288D1", fontWeight: 500 }}>
          Year: {selectedYear} &nbsp; | &nbsp; Month: {formatMonth(selectedMonth)}
        </span>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 24 }}>Loading...</div>
      ) : (
        <div className="table-responsive">
          <table style={{
            width: "100%", borderCollapse: "collapse", backgroundColor: "#FFF",
            borderRadius: 12, overflow: "hidden", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#00BCD4", color: "#FFF" }}>
                <th style={{ padding: 12, textAlign: "left" }}>Nationality</th>
                <th style={{ padding: 12, textAlign: "left" }}>Count</th>
                <th style={{ padding: 12, textAlign: "left" }}>Male</th>
                <th style={{ padding: 12, textAlign: "left" }}>Female</th>
              </tr>
            </thead>
            <tbody>
              {nationalityCounts.map((n, i) => (
                <tr key={n.nationality} style={{
                  borderBottom: "1px solid #B0BEC5",
                  backgroundColor: i % 2 === 0 ? "#F5F5F5" : "#FFF"
                }}>
                  <td style={{ padding: 12, color: "#37474F" }}>{n.nationality}</td>
                  <td style={{ padding: 12, color: "#37474F" }}>{n.count}</td>
                  <td style={{ padding: 12, color: "#37474F" }}>{n.male_count}</td>
                  <td style={{ padding: 12, color: "#37474F" }}>{n.female_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserNationalityCounts;