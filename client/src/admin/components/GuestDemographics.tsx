/**
 * GuestDemographics.tsx
 * 
 * Panglao Tourist Data Management System - Guest Demographics Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays and exports guest demographics for Panglao tourism statistics.
 * It summarizes guest check-in data by gender, age group, and marital status, and provides both detailed and summary tables.
 * Users can export the demographics data as a multi-sheet Excel report for analytics and official reporting.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Receives guest demographics data for a selected year and month.
 * - Calculates totals for each demographic category (gender, age group, marital status).
 * - Renders summary and detailed tables of guest demographics.
 * - Provides an export button to download the data as a multi-sheet Excel file.
 * - Formats tables and export sheets for clarity and official use.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses XLSX and file-saver libraries to export multi-sheet Excel reports.
 * - Responsive and accessible UI with styled tables and export button.
 * - Modular logic for calculating totals and formatting data.
 * - Integrates with Lucide icons for improved UX.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in admin and user dashboards to review and export guest demographics for monthly accommodation submissions.
 * - Allows users and admins to generate official reports for record-keeping or government submission.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The guestDemographics prop should be an array of demographic objects for the selected year and month.
 * - Extend this component to support additional demographic categories or export formats as needed.
 * - Update table columns or export logic if reporting requirements change.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/admin/pages/MainDashboard.tsx        (renders GuestDemographics)
 * - src/user/components/UserGuestDemographics.jsx (user version)
 * - server/controllers/adminController.js    (handles backend demographics logic)
 * - server/routes/admin.js                   (defines backend endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React from "react";
import { Download } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList
} from "recharts";

interface GuestDemographic {
  gender: string;
  age_group: string;
  status: string;
  count: number | string;
}

interface GuestDemographicsProps {
  guestDemographics: GuestDemographic[];
  selectedYear: number;
  selectedMonth: number;
  formatMonth: (month: number) => string;
}

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

const GuestDemographics: React.FC<GuestDemographicsProps> = ({
  guestDemographics,
  selectedYear,
  selectedMonth,
  formatMonth
}) => {
  // Calculate totals for charts
  const genderData = [
    { name: "Male", value: guestDemographics.filter(d => d.gender === "Male").reduce((a, b) => a + (typeof b.count === "string" ? parseInt(b.count) || 0 : b.count), 0) },
    { name: "Female", value: guestDemographics.filter(d => d.gender === "Female").reduce((a, b) => a + (typeof b.count === "string" ? parseInt(b.count) || 0 : b.count), 0) }
  ];

  const ageGroupData = ageGroupLabels.map((label, i) => ({
    name: label,
    value: guestDemographics.filter(d => d.age_group === label).reduce((a, b) => a + (typeof b.count === "string" ? parseInt(b.count) || 0 : b.count), 0),
    fill: AGE_COLORS[i % AGE_COLORS.length]
  }));

  const statusData = statusLabels.map((label, i) => ({
    name: label,
    value: guestDemographics.filter(d => d.status === label).reduce((a, b) => a + (typeof b.count === "string" ? parseInt(b.count) || 0 : b.count), 0),
    fill: STATUS_COLORS[i % STATUS_COLORS.length]
  }));

  // Export logic (unchanged)
  const exportGuestDemographics = () => {
    const detailedData = guestDemographics.map(d => [
      d.gender, d.age_group, d.status, typeof d.count === 'string' ? parseInt(d.count) || 0 : d.count
    ]);
    const summaryData = [
      ["Male", genderData[0].value],
      ["Female", genderData[1].value],
      ...ageGroupData.map(a => [a.name, a.value]),
      ...statusData.map(s => [s.name, s.value])
    ];
    const detailedSheet = XLSX.utils.aoa_to_sheet([
      ["Panglao Report of Guest Demographics", "", "", ""],
      ["Year", selectedYear, "", ""],
      ["Month", formatMonth(selectedMonth), "", ""],
      ["Gender", "AgeGroup", "Status", "Count"],
      ...detailedData
    ]);
    detailedSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    detailedSheet["!cols"] = Array(4).fill({ wch: 15 });

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ["Panglao Report of Guest Demographics", "", "", ""],
      ["Year", selectedYear, "", ""],
      ["Month", formatMonth(selectedMonth), "", ""],
      ["Category", "Total", "", ""],
      ...summaryData.map(([cat, total]) => [cat, total, "", ""])
    ]);
    summarySheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    summarySheet["!cols"] = Array(4).fill({ wch: 15 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, detailedSheet, "Detailed Data");
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary Data");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }),
      `Guest_Demographics_${selectedYear}_${selectedMonth}.xlsx`);
  };

  // Responsive chart container style
  const chartCardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    padding: 16,
    margin: 8,
    flex: 1,
    minWidth: 260,
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#E0F7FA" }}>
      <h3 style={{ color: "#37474F", marginBottom: 20 }}>Guest Demographics of Guest Check-Ins</h3>
      {/* Export Button */}
  
      <button
          style={{
            backgroundColor: "#00BCD4",
            color: "#FFF",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px", // space between icon and text
          }}
          onClick={exportGuestDemographics}
        >
          <Download size={16}/> Monthly Metrics
        </button>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        justifyContent: "center",
        alignItems: "stretch",
        marginBottom: 24
      }}>
        
        {/* Men vs Women Donut Chart */}
        <div style={chartCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span role="img" aria-label="men-vs-women" style={{ fontSize: 22 }}>👥</span>
            <span style={{ fontWeight: 600, fontSize: 18, color: "#263238" }}>Men vs Women</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                fill="#8884d8"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {genderData.map((entry, idx) => (
                  <Cell key={`cell-gender-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ width: "100%", marginTop: 8 }}>
            {genderData.map((g, idx) => (
              <div key={g.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: COLORS[idx % COLORS.length]
                }} />
                <span style={{ color: "#37474F", fontWeight: 500 }}>{g.name}</span>
                <span style={{ marginLeft: "auto", fontWeight: 700 }}>{g.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Age Groups Horizontal Bar Chart */}
        <div style={chartCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span role="img" aria-label="age-groups" style={{ fontSize: 22 }}>🎂</span>
            <span style={{ fontWeight: 600, fontSize: 18, color: "#263238" }}>Age Groups</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={ageGroupData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 12, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              {/* increased width so full labels are visible */}
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 13 }} />
              <Bar dataKey="value" fill="#4ade80" radius={[6, 6, 6, 6]}>
                {ageGroupData.map((entry, idx) => (
                  <Cell key={`cell-age-${idx}`} fill={AGE_COLORS[idx % AGE_COLORS.length]} />
                ))}
                {/* show value next to bar */}
                <LabelList dataKey="value" position="right" formatter={v => v} />
              </Bar>
              <RechartsTooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Relationship Status Vertical Bar Chart */}
        <div style={chartCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span role="img" aria-label="relationship-status" style={{ fontSize: 22 }}>💜</span>
            <span style={{ fontWeight: 600, fontSize: 18, color: "#263238" }}>Relationship Status</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={statusData}
              margin={{ top: 8, right: 16, left: 8, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              {/* ensure labels are readable and not cut off */}
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
              <YAxis allowDecimals={false} />
              <Bar dataKey="value" fill="#a78bfa" radius={[6,6,0,0]}>
                {statusData.map((entry, idx) => (
                  <Cell key={`cell-status-${idx}`} fill={STATUS_COLORS[idx % STATUS_COLORS.length]} />
                ))}
                {/* show value above each bar */}
                <LabelList dataKey="value" position="top" formatter={v => v} />
              </Bar>
              <RechartsTooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="table-responsive">
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#FFF",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#00BCD4", color: "#FFF" }}>
              <th style={{ padding: 12, textAlign: "left" }}>Age Group</th>
              <th style={{ padding: 12, textAlign: "left" }}>Gender</th>
              <th style={{ padding: 12, textAlign: "left" }}>Status</th>
              <th style={{ padding: 12, textAlign: "left" }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {guestDemographics.map((demo, i) => (
              <tr
                key={`${demo.gender}-${demo.age_group}-${demo.status}-${i}`}
                style={{
                  borderBottom: "1px solid #B0BEC5",
                  backgroundColor: i % 2 === 0 ? "#F5F5F5" : "#FFF"
                }}
              >
                <td style={{ padding: 12, color: "#37474F" }}>{demo.age_group}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{demo.gender}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{demo.status}</td>
                <td style={{ padding: 12, color: "#37474F" }}>
                  {typeof demo.count === 'string' ? parseInt(demo.count) || 0 : demo.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestDemographics;
