/**
 * NationalityCounts.tsx
 * 
 * Panglao Tourist Data Management System - Nationality Counts Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays a table of guest nationality counts for Panglao tourism statistics.
 * It summarizes and presents nationality breakdowns (total, male, female) for the selected year and month, and provides an export feature to generate an Excel report.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Renders a responsive table showing nationality, total count, male count, and female count for each guest nationality.
 * - Provides an export button to download the nationality counts as an Excel file, including all relevant columns.
 * - Handles loading, empty, and error states gracefully.
 * - Displays contextual information (selected year and month) above the table.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses XLSX and file-saver libraries to export nationality counts as a styled Excel report.
 * - Responsive and accessible UI with clear feedback and export functionality.
 * - Modular design for easy integration into admin and user dashboards.
 * - Customizable styling for table and export button.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the admin and user dashboards to review and export monthly nationality breakdowns of guests.
 * - Allows users and admins to generate official reports for record-keeping or submission.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The nationalityCounts prop should be an array of nationality count objects for the selected year and month.
 * - Extend the export logic to include additional fields or sheets as needed.
 * - Update table columns or formatting if reporting requirements change.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/admin/pages/MainDashboard.tsx        (renders NationalityCounts)
 * - src/user/components/UserNationalityCounts.jsx (user version)
 * - server/controllers/adminController.js    (handles backend nationality logic)
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

interface NationalityCount {
  nationality: string;
  count: number | string;
  male_count: number | string;
  female_count: number | string;
}

interface NationalityCountsProps {
  nationalityCounts: NationalityCount[];
  selectedYear: number;
  selectedMonth: number;
  formatMonth: (month: number) => string;
}

const NationalityCounts: React.FC<NationalityCountsProps> = ({
  nationalityCounts,
  selectedYear,
  selectedMonth,
  formatMonth
}) => {
  const exportNationalityCounts = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      nationalityCounts.map(n => ({
        Nationality: n.nationality,
        Count: n.count,
        Male: n.male_count,
        Female: n.female_count,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, "Nationality Counts");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `Nationality_Counts_${selectedYear}_${formatMonth(selectedMonth)}.xlsx`
    );
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#E0F7FA" }}>
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
        onClick={exportNationalityCounts}
      >
        <Download size={16}/>Nationality Counts
      </button>
      <div className="table-responsive">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#FFF",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#00BCD4", color: "#FFF" }}>
              {["Nationality", "Count", "Male", "Female"].map(label => (
                <th 
                  key={label} 
                  style={{ padding: 12, textAlign: "left" }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nationalityCounts.map((n, i) => (
              <tr
                key={`${n.nationality}-${i}`}
                style={{
                  borderBottom: "1px solid #B0BEC5",
                  backgroundColor: i % 2 === 0 ? "#F5F5F5" : "#FFF",
                }}
              >
                <td style={{ padding: 12, color: "#37474F" }}>{n.nationality}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{n.count}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{n.male_count}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{n.female_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NationalityCounts;