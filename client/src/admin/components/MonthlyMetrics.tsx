/**
 * MonthlyMetrics.tsx
 * 
 * Panglao Tourist Data Management System - Monthly Metrics Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays a table of monthly accommodation metrics for Panglao tourism, including guest check-ins, overnight stays, room occupancy, and calculated averages.
 * It provides a summary view for each month of the selected year and allows users to export the metrics as an Excel report.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Renders a responsive table of monthly metrics for the selected year.
 * - Formats metric values and month names for display.
 * - Provides an export button to download the metrics as an Excel file, including all relevant columns.
 * - Handles empty, loading, and error states gracefully.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses XLSX and file-saver libraries to export metrics as a styled Excel report.
 * - Responsive and accessible UI with clear feedback and export functionality.
 * - Modular design for easy integration into admin and user dashboards.
 * - Customizable column widths and formatting for exported reports.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the admin and user dashboards to review and export monthly accommodation metrics.
 * - Allows users and admins to generate official reports for record-keeping or submission.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The monthlyMetrics prop should be an array of metric objects for each month.
 * - Extend the export logic to include additional fields or sheets as needed.
 * - Update table columns or formatting if metric requirements change.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/admin/pages/MainDashboard.tsx        (renders MonthlyMetrics)
 * - src/user/components/UserMonthlyMetrics.jsx (user version)
 * - server/controllers/adminController.js    (handles backend metrics logic)
 * - server/routes/admin.js                   (defines backend endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

interface MonthlyMetric {
  month: number;
  total_check_ins: number | string;
  total_overnight: number | string;
  total_occupied: number | string;
  average_guest_nights: number | string;
  average_room_occupancy_rate: number | string;
  average_guests_per_room: number | string;
  total_rooms: number | string;
  total_submissions: number | string;
  submission_rate: number | string;
}

interface MonthlyMetricsProps {
  monthlyMetrics: MonthlyMetric[];
  selectedYear: number;
  formatMonth: (month: number) => string;
  toNumber: (value: number | string) => number;
}

const MonthlyMetrics: React.FC<MonthlyMetricsProps> = ({
  monthlyMetrics,
  selectedYear,
  formatMonth,
  toNumber
}) => {
  const exportMonthlyMetrics = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      monthlyMetrics.map(m => ({
        Month: formatMonth(m.month),
        "Total No. Guest Check-Ins": toNumber(m.total_check_ins),
        "Total No. of Guest Staying Overnight": toNumber(m.total_overnight),
        "Total No. Rooms Occupied": toNumber(m.total_occupied),
        "Avg. Length of Stay": toNumber(m.average_guest_nights).toFixed(2), // <-- changed label and value
        "Avg. Room Occupancy Rate": `${toNumber(m.average_room_occupancy_rate).toFixed(2)}%`,
        "Avg. Guests per Room": toNumber(m.average_guests_per_room).toFixed(2),
        "Total Rooms": toNumber(m.total_rooms),
        "Total Submissions": toNumber(m.total_submissions),
        "Submission Rate": `${toNumber(m.submission_rate).toFixed(2)}%`,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, "Monthly Metrics");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `Monthly_Metrics_${selectedYear}.xlsx`);
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#E0F7FA" }}>
      <h3 style={{ color: "#37474F", marginBottom: 20 }}>Monthly Metrics</h3>
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
        onClick={exportMonthlyMetrics}
      >
        <Download size={16}/> Monthly Metrics
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
              {[
                "Month",
                "Total No. of Guests Check-In",
                "Total No. of Guest-Nights",
                "Total Occupied",
                "Avg. Length of Stay", // <-- changed label
                "Avg. Room Occupancy Rate",
                "Avg. Guests per Room",
                "Total Rooms",
                "Total Submissions",
                "Submission Rate",
              ].map(label => (
                <th key={label} style={{ padding: 12, textAlign: "left" }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthlyMetrics.map(m => (
              <tr
                key={m.month}
                style={{
                  borderBottom: "1px solid #B0BEC5",
                  backgroundColor: m.month % 2 === 0 ? "#F5F5F5" : "#FFF",
                }}
              >
                <td style={{ padding: 12, color: "#37474F" }}>{formatMonth(m.month)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{toNumber(m.total_check_ins)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{toNumber(m.total_overnight)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{toNumber(m.total_occupied)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{toNumber(m.average_guest_nights).toFixed(2)}</td> {/* <-- Avg. Length of Stay */}
                <td style={{ padding: 12, color: "#37474F" }}>{toNumber(m.average_room_occupancy_rate).toFixed(2)}%</td>
                <td style={{ padding: 12, color: "#37474F" }}>{toNumber(m.average_guests_per_room).toFixed(2)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{toNumber(m.total_rooms)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{toNumber(m.total_submissions)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{toNumber(m.submission_rate).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyMetrics;
