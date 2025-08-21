/**
 * UserMonthlyMetrics.jsx
 * 
 * Panglao Tourist Data Management System - User Monthly Metrics Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays monthly accommodation metrics for the authenticated user, including guest check-ins, overnight stays, room occupancy, and calculated averages.
 * It provides a table view of metrics for each month of the selected year and allows users to export the data as an Excel report.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Renders a summary table of monthly metrics for the selected year.
 * - Formats metric values and month names for display.
 * - Provides an export button to download the metrics as an Excel file, including company and accommodation info.
 * - Handles loading, empty, and error states gracefully.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses XLSX and file-saver libraries to export metrics as a styled Excel report.
 * - Responsive and accessible UI with clear feedback and export functionality.
 * - Modular design for easy integration into the user dashboard.
 * - Customizable column widths and formatting for exported reports.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the user dashboard to review and export monthly accommodation metrics.
 * - Allows users to generate official reports for record-keeping or submission.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The monthlyMetrics prop should be an array of metric objects for each month.
 * - The user prop provides company and accommodation details for the report header.
 * - Extend the export logic to include additional fields or sheets as needed.
 * - Update table columns or formatting if metric requirements change.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/pages/UserDashboard.jsx         (renders UserMonthlyMetrics)
 * - server/controllers/submissionsController.js (handles backend metrics logic)
 * - server/routes/submissions.js                (defines backend endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {Download} from "lucide-react"

const UserMonthlyMetrics = ({ monthlyMetrics, selectedYear, formatMonth, toNumber, user }) => {
  const exportMonthlyMetrics = () => {
    // Create data array with report info and monthly metrics in one sheet
    const data = [
      ["MONTHLY METRICS REPORT"],
      [""], // Empty row for spacing
      ["Company Name", user?.company_name || "N/A"],
      ["Accommodation Type", user?.accommodation_type || "N/A"],
      ["Year", selectedYear],
      [""], // Empty row for spacing
      [""], // Empty row for spacing
      // Headers for monthly metrics
      ["Month", "Total No. Guest Check-Ins", "Total No. of Guest Staying Overnight", "Total No. Rooms Occupied", "Ave. Guest-Nights", "Ave. Room Occupancy Rate", "Ave. Guests per Room", "Total Rooms"],
      // Monthly metrics data
      ...monthlyMetrics.map(m => [
        formatMonth(m.month),
        toNumber(m.total_check_ins),
        toNumber(m.total_overnight),
        toNumber(m.total_occupied),
        toNumber(m.average_guest_nights).toFixed(2),
        `${toNumber(m.average_room_occupancy_rate).toFixed(2)}%`,
        toNumber(m.average_guests_per_room).toFixed(2),
        toNumber(m.total_rooms),
      ])
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, "Monthly Metrics");
    
    // Auto-size columns
    worksheet['!cols'] = [
      { width: 15 }, // Month
      { width: 25 }, // Total Check-ins
      { width: 30 }, // Total Overnight
      { width: 25 }, // Total Occupied
      { width: 20 }, // Ave Guest-Nights
      { width: 25 }, // Ave Room Occupancy Rate
      { width: 20 }, // Ave Guests per Room
      { width: 15 }, // Total Rooms
    ];
    
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }), 
      `${user?.company_name || 'Resort'}_${selectedYear}_Monthly_Metrics_Report.xlsx`
    );
  };

  // Helper function to safely convert to number
  const safeToNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800">Monthly Metrics for {selectedYear}</h4>
        <button
          style={{
            backgroundColor: "#00BCD4",
            color: "#FFF",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
          onClick={exportMonthlyMetrics}
        >
          {/* Button: Export Monthly Metrics */}
          <Download size={16}/>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#FFF",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#00BCD4", color: "#FFF" }}>
              {[
                "Month",
                "Total No. Guest Check-Ins",
                "Total No. Guests Staying Overnight",
                "Total No. Rooms Occupied",
                "Ave. Guest-Nights",
                "Ave. Room Occupancy Rate",
                "Ave. Guests per Room",
                "Total Rooms",
              ].map(label => (
                <th key={label} style={{ padding: 12, textAlign: "left", fontSize: "14px", fontWeight: "600" }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthlyMetrics.map(m => (
              <tr
                key={m.month}
                style={{
                  borderBottom: "1px solid #E0E0E0",
                  backgroundColor: m.month % 2 === 0 ? "#F8F9FA" : "#FFF",
                }}
              >
                <td style={{ padding: 12, color: "#37474F", fontWeight: "500" }}>{formatMonth(m.month)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{safeToNumber(m.total_check_ins)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{safeToNumber(m.total_overnight)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{safeToNumber(m.total_occupied)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{safeToNumber(m.average_guest_nights).toFixed(2)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{safeToNumber(m.average_room_occupancy_rate).toFixed(2)}%</td>
                <td style={{ padding: 12, color: "#37474F" }}>{safeToNumber(m.average_guests_per_room).toFixed(2)}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{safeToNumber(m.total_rooms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserMonthlyMetrics; 