/**
 * UserGuestDemographics.jsx
 * 
 * Panglao Tourist Data Management System - User Guest Demographics Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays guest demographics and nationality counts for a user's monthly accommodation submission.
 * It fetches, summarizes, and presents guest data (gender, age group, marital status) and nationality breakdowns for the selected year and month.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Fetches guest demographics and nationality counts from the backend API for the authenticated user, year, and month.
 * - Calculates summary statistics (totals by gender, age group, marital status) from the raw data.
 * - Renders summary and detailed tables for guest demographics.
 * - Renders a nationality counts table in a separate Excel sheet for export.
 * - Provides an export button to download both guest demographics and nationality counts as a multi-sheet Excel report.
 * - Handles loading, error, and empty states gracefully.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses axios for API communication and sessionStorage for authentication.
 * - Utilizes XLSX and file-saver libraries to export multi-sheet Excel reports.
 * - Responsive and accessible UI with clear feedback and export functionality.
 * - Modular summary calculation for easy extension or customization.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the user dashboard to review monthly guest demographics and nationality breakdowns.
 * - Allows users to export official reports for record-keeping or submission.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The backend endpoints for fetching data are:
 *     GET /api/submissions/guest-demographics/:userId?year=YYYY&month=MM
 *     GET /api/submissions/nationality-counts/:userId?year=YYYY&month=MM
 * - Update this component if guest categories or export requirements change.
 * - Extend summaryTableData and export logic for new demographic or nationality fields as needed.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/pages/UserDashboard.jsx         (renders UserGuestDemographics)
 * - server/controllers/submissionsController.js (handles backend guest and nationality logic)
 * - server/routes/submissions.js                (defines backend endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const COLORS = ["#42a5f5", "#ec4899"];
const AGE_COLORS = ["#60a5fa", "#38bdf8", "#34d399", "#4ade80", "#a3e635", "#facc15"];
const STATUS_COLORS = ["#a78bfa", "#818cf8", "#f472b6", "#f87171", "#fbbf24"];

const ageGroupLabels = [
  "Children",
  "Teens",
  "Young Adults",
  "Adults",
  "Middle-Aged",
  "Seniors"
];

const statusLabels = [
  "Married",
  "Single",
  "N/A",
  "Divorced",
  "Widowed"
];

const UserGuestDemographics = ({ user, selectedYear, selectedMonth, formatMonth }) => {
  const [guestDemographics, setGuestDemographics] = useState([]);
  const [nationalityCounts, setNationalityCounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const year = Number(selectedYear);
    const month = Number(selectedMonth);

    // if invalid year/month, clear data and don't call API
    if (!year || !month || month < 1 || month > 12) {
      setGuestDemographics([]);
      setNationalityCounts([]);
      return;
    }

    setLoading(true);
    const source = axios.CancelToken.source();
    const token = sessionStorage.getItem("token");

    Promise.all([
      axios.get(`${API_BASE_URL}/api/submissions/guest-demographics/${user.user_id}`, {
        params: { year, month },
        headers: { Authorization: `Bearer ${token}` },
        cancelToken: source.token
      }),
      axios.get(`${API_BASE_URL}/api/submissions/nationality-counts/${user.user_id}`, {
        params: { year, month },
        headers: { Authorization: `Bearer ${token}` },
        cancelToken: source.token
      })
    ])
      .then(([demographicsRes, nationalityRes]) => {
        setGuestDemographics(Array.isArray(demographicsRes.data) ? demographicsRes.data : []);
        setNationalityCounts(Array.isArray(nationalityRes.data) ? nationalityRes.data : []);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          console.error("Error fetching user guest demographics:", err);
          setGuestDemographics([]);
          setNationalityCounts([]);
        }
      })
      .finally(() => setLoading(false));

    return () => source.cancel();
  }, [user, selectedYear, selectedMonth]);

  // Safely compute totals using maps to avoid key mismatches
  const genderCounts = { Male: 0, Female: 0 };
  const ageCounts = ageGroupLabels.reduce((acc, label) => ({ ...acc, [label]: 0 }), {});
  const statusCounts = statusLabels.reduce((acc, label) => ({ ...acc, [label]: 0 }), {});

  guestDemographics.forEach((item) => {
    const c = typeof item.count === "string" ? parseInt(item.count, 10) || 0 : (Number(item.count) || 0);
    if (item.gender && genderCounts[item.gender] !== undefined) genderCounts[item.gender] += c;
    if (item.age_group && ageCounts[item.age_group] !== undefined) ageCounts[item.age_group] += c;
    if (item.status && statusCounts[item.status] !== undefined) statusCounts[item.status] += c;
  });

  // add N/A to summary so users see its total
  const summaryTableData = [
    { Category: "Male", Total: genderCounts.Male },
    { Category: "Female", Total: genderCounts.Female },
    { Category: "Children (0–12)", Total: ageCounts["Children"] || 0 },
    { Category: "Teens (13–17)", Total: ageCounts["Teens"] || 0 },
    { Category: "Young Adults (18–24)", Total: ageCounts["Young Adults"] || 0 },
    { Category: "Adults (25–44)", Total: ageCounts["Adults"] || 0 },
    { Category: "Middle-Aged (45–59)", Total: ageCounts["Middle-Aged"] || 0 },
    { Category: "Seniors (60+)", Total: ageCounts["Seniors"] || 0 },
    { Category: "Married", Total: statusCounts["Married"] || 0 },
    { Category: "Single", Total: statusCounts["Single"] || 0 },
    { Category: "N/A", Total: statusCounts["N/A"] || 0 },
  ];

  // Chart data - include all labels (so axis and labels are stable)
  const ageGroupData = ageGroupLabels.map((label, i) => ({
    name: label,
    value: ageCounts[label] || 0,
    fill: AGE_COLORS[i % AGE_COLORS.length]
  }));

  const statusData = statusLabels.map((label, i) => ({
    name: label,
    value: statusCounts[label] || 0,
    fill: STATUS_COLORS[i % STATUS_COLORS.length]
  }));

  const exportGuestDemographics = () => {
    const wb = XLSX.utils.book_new();

    const demographicsData = [
      ["GUEST DEMOGRAPHICS REPORT"],
      [],
      ["Company Name", user?.company_name || "N/A"],
      ["Accommodation Type", user?.accommodation_type || "N/A"],
      ["Month", formatMonth(selectedMonth)],
      ["Year", selectedYear],
      [],
      ["SUMMARY"],
      ["Category", "Total"],
      ...summaryTableData.map(r => [r.Category, r.Total]),
      [],
      ["DETAILED BREAKDOWN"],
      ["Gender", "Age Group", "Status", "Count"],
      ...guestDemographics.map(demo => [
        demo.gender,
        demo.age_group,
        demo.status,
        typeof demo.count === "string" ? parseInt(demo.count, 10) || 0 : demo.count
      ])
    ];

    const demographicsWorksheet = XLSX.utils.aoa_to_sheet(demographicsData);
    demographicsWorksheet['!cols'] = [{ width: 20 }, { width: 25 }, { width: 15 }, { width: 12 }];
    XLSX.utils.book_append_sheet(wb, demographicsWorksheet, "Guest Demographics");

    const nationalityData = [
      ["NATIONALITY COUNTS REPORT"],
      [],
      ["Company Name", user?.company_name || "N/A"],
      ["Accommodation Type", user?.accommodation_type || "N/A"],
      ["Month", formatMonth(selectedMonth)],
      ["Year", selectedYear],
      [],
      ["Nationality", "Count", "Male", "Female"],
      ...nationalityCounts.map(n => [n.nationality, n.count, n.male_count, n.female_count])
    ];
    const nationalityWorksheet = XLSX.utils.aoa_to_sheet(nationalityData);
    nationalityWorksheet['!cols'] = [{ width: 25 }, { width: 12 }, { width: 12 }, { width: 12 }];
    XLSX.utils.book_append_sheet(wb, nationalityWorksheet, "Nationality Counts");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `${user?.company_name || 'Establishment'}_${formatMonth(selectedMonth)}_${selectedYear}_Guest_Demographics.xlsx`);
  };

  const chartCardStyle = {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#E0F7FA", marginTop: 24, borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ color: "#37474F", margin: 0 }}>Guest Demographics of Guest Check-Ins</h3>
        <button
          style={{
            backgroundColor: "#00BCD4",
            color: "#FFF",
            border: "none",
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
          onClick={exportGuestDemographics}
        >
          <Download size={16}/> Export
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ color: "#0288D1", fontWeight: 500 }}>
          Year: {selectedYear} &nbsp; | &nbsp; Month: {formatMonth(selectedMonth)}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 24 }}>Loading...</div>
      ) : (
        <>
          {/* Charts row - responsive */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "center",
            alignItems: "stretch",
            marginBottom: 16
          }}>
            {/* Donut Chart */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, flex: "1 1 300px", minWidth: 280, maxWidth: 420, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span role="img" aria-label="men-vs-women" style={{ fontSize: 20 }}>👥</span>
                <span style={{ fontWeight: 600, fontSize: 16, color: "#263238" }}>Men vs Women</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[{ name: "Male", value: genderCounts.Male }, { name: "Female", value: genderCounts.Female }]
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={70}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill={COLORS[0]} />
                    <Cell fill={COLORS[1]} />
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 8 }}>
                {["Male", "Female"].map((k, idx) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: COLORS[idx] }} />
                    <span style={{ color: "#37474F", fontWeight: 500 }}>{k}</span>
                    <span style={{ marginLeft: "auto", fontWeight: 700 }}>{genderCounts[k]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Groups Horizontal */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, flex: "1 1 420px", minWidth: 300, maxWidth: 640, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span role="img" aria-label="age-groups" style={{ fontSize: 20 }}>🎂</span>
                <span style={{ fontWeight: 600, fontSize: 16, color: "#263238" }}>Age Groups</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ageGroupData} layout="vertical" margin={{ top: 8, right: 24, left: 12, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 13 }} />
                  <Bar dataKey="value" radius={[6,6,6,6]}>
                    {ageGroupData.map((entry, idx) => (
                      <Cell key={`cell-age-${idx}`} fill={AGE_COLORS[idx % AGE_COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="right" formatter={v => v} />
                  </Bar>
                  <RechartsTooltip />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Relationship Status Vertical */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, flex: "1 1 320px", minWidth: 280, maxWidth: 420, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span role="img" aria-label="relationship-status" style={{ fontSize: 20 }}>💜</span>
                <span style={{ fontWeight: 600, fontSize: 16, color: "#263238" }}>Relationship Status</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusData} margin={{ top: 8, right: 12, left: 8, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                  <YAxis allowDecimals={false} />
                  <Bar dataKey="value" radius={[6,6,0,0]}>
                    {statusData.map((entry, idx) => (
                      <Cell key={`cell-status-${idx}`} fill={STATUS_COLORS[idx % STATUS_COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="top" formatter={v => v} />
                  </Bar>
                  <RechartsTooltip />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Detailed Table (unchanged) */}
          <div className="table-responsive" style={{ marginBottom: 20 }}>
            <table style={{
              width: "100%", borderCollapse: "collapse", backgroundColor: "#FFF",
              borderRadius: 12, overflow: "hidden", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
            }}>
              <thead>
                <tr style={{ backgroundColor: "#00BCD4", color: "#FFF" }}>
                  <th style={{ padding: 12, textAlign: "left" }}>Gender</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Age Group</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {guestDemographics.map((demo, i) => (
                  <tr key={i} style={{
                    borderBottom: "1px solid #B0BEC5",
                    backgroundColor: i % 2 === 0 ? "#F5F5F5" : "#FFF"
                  }}>
                    <td style={{ padding: 12, color: "#37474F" }}>{demo.gender}</td>
                    <td style={{ padding: 12, color: "#37474F" }}>{demo.age_group}</td>
                    <td style={{ padding: 12, color: "#37474F" }}>{demo.status}</td>
                    <td style={{ padding: 12, color: "#37474F" }}>{demo.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserGuestDemographics;
